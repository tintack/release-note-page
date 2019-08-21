package main

import (
	"context"
	"flag"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/google/go-github/github"
	"github.com/menghanl/release-git-bot/ghclient"
	"github.com/menghanl/release-git-bot/notes"
	"golang.org/x/oauth2"
)

var token = flag.String("token", "", "github token")

var tc *http.Client

func commaStringToSet(s string) map[string]struct{} {
	ret := make(map[string]struct{})
	tmp := strings.Split(s, ",")
	for _, t := range tmp {
		ret[t] = struct{}{}
	}
	return ret
}

func releaseHandler(c *gin.Context) {
	if *token == "" {
		*token = os.Getenv("GITHUB_TOKEN")
	}
	if *token == "" {
		*token = c.DefaultQuery("token", "")
	}
	if *token != "" {
		ctx := context.Background()
		ts := oauth2.StaticTokenSource(
			&oauth2.Token{AccessToken: *token},
		)
		tc = oauth2.NewClient(ctx, ts)
	}

	org := c.DefaultQuery("org", "grpc")
	repo := c.DefaultQuery("repo", "grpc-go")
	version := c.DefaultQuery("version", "1.12")
	thanks := new(bool)
	*thanks = true
	client := ghclient.New(tc, org, repo)
	prs := client.GetMergedPRsForMilestone(version[1:] + " Release")

	var (
		thanksFilter func(pr *github.Issue) bool
	)
	if *thanks {
		urwelcomeMap := commaStringToSet("")
		verymuchMap := commaStringToSet("")
		grpcMembers := client.GetOrgMembers("grpc")

		thanksFilter = func(pr *github.Issue) bool {
			user := pr.GetUser().GetLogin()
			_, isGRPCMember := grpcMembers[user]
			_, isWelcome := urwelcomeMap[user]
			_, isVerymuch := verymuchMap[user]

			return *thanks && (isVerymuch || (!isGRPCMember && !isWelcome))
		}
	}

	// generate notes

	ns := notes.GenerateNotes(org, repo, version, prs, notes.Filters{
		SpecialThanks: thanksFilter,
	})

	c.JSON(200, ns)
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		log.Fatal("$PORT must be set")
	}

	flag.Parse()

	r := gin.New()
	path, _ := filepath.Abs("./build")
	r.Use(static.Serve("/", static.LocalFile(path, true)))
	r.LoadHTMLGlob(filepath.Join(path, "index.html"))
	r.NoRoute(func(c *gin.Context) {
		path := strings.Split(c.Request.URL.Path, "/")
		if path[1] != "release" {
			c.JSON(http.StatusNotFound, gin.H{"msg": "no route", "body": nil})
		} else {
			c.HTML(http.StatusOK, "index.html", "")
		}
	})

	api := r.Group("/api")
	{
		api.GET("/ping", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"message": "pong",
			})
		})
		api.GET("/release", releaseHandler)
	}

	// Handle all requests using net/http
	http.Handle("/", r)
	r.Run(":" + port)
}

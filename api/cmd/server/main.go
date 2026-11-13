package main

import (
	"log"
	"net"
	"net/http"
	"os"
	"strings"

	"agent/internal/app"
	"agent/internal/httpapi"
)

func main() {
	path := os.Getenv("AGENT_DB")
	if path == "" {
		path = os.Getenv("NOBAT_DB")
	}
	if path == "" {
		path = "/workspace/data/agent.db"
	}
	addr := os.Getenv("AGENT_ADDR")
	if addr == "" {
		addr = os.Getenv("NOBAT_ADDR")
	}
	if addr == "" {
		addr = "127.0.0.1:8090"
	}
	db, err := app.Open(path)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	srv := &httpapi.Server{App: app.New(db)}
	go srv.App.RunReminders()
	log.Printf("agent api %s", addr)
	if strings.HasPrefix(addr, "/") || strings.HasPrefix(addr, "unix:") {
		sock := strings.TrimPrefix(addr, "unix:")
		_ = os.Remove(sock)
		ln, err := net.Listen("unix", sock)
		if err != nil {
			log.Fatal(err)
		}
		if err := os.Chmod(sock, 0o666); err != nil {
			log.Fatal(err)
		}
		log.Fatal(http.Serve(ln, srv.Handler()))
	}
	log.Fatal(http.ListenAndServe(addr, srv.Handler()))
}

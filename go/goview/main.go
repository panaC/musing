package main

import (
	"fmt"
	"net/http"

	"github.com/foolin/goview"
	"github.com/go-chi/chi"
)

type Publication struct {
	CoverHref string
	Title     string
	Author    string
}

func main() {

	r := chi.NewRouter()

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		err := goview.Render(w, http.StatusOK, "index", goview.M{
			"title": "Index title!",
			"add": func(a int, b int) int {
				return a + b
			},
			"authors":    []string{"apple", "banana", "cherry"},
			"publishers": []string{"apple", "banana", "cherry"},
			"languages":  []string{"apple", "banana", "cherry"},
			"categories": []string{"apple", "banana", "cherry"},
			"publications": []Publication{{CoverHref: "/static/cover/1.jpg", Title: "my first book", Author: "pierre"},
				{CoverHref: "/static/cover/2.jpg", Title: "my second book", Author: "arthur"}},
		})
		if err != nil {
			fmt.Fprintf(w, "Render index error: %v!", err)
		}
	})

	fmt.Println("Listening and serving HTTP on :9090")
	http.ListenAndServe(":9090", r)

}

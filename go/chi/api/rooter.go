package api

import (
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func signin(w http.ResponseWriter, r *http.Request) {
	// Implementation for the signin handler
	// This function will handle the "/signin" route
}

func signout(w http.ResponseWriter, r *http.Request) {
	// Implementation for the signout handler
	// This function will handle the "/signout" route
}

func signup(w http.ResponseWriter, r *http.Request) {
	// Implementation for the signup handler
	// This function will handle the "/signup" route
}

func userInfos(w http.ResponseWriter, r *http.Request) {
	// Implementation for the userInfos handler
	// This function will handle the "/user/infos" and "/user/bookshelf" routes
}

func publicationBuyAction(w http.ResponseWriter, r *http.Request) {
	// Implementation for the publicationBuyAction handler
	// This function will handle the "/catalog/publication/{id}/buy" route
}

func publicationLoanAction(w http.ResponseWriter, r *http.Request) {
	// Implementation for the publicationLoanAction handler
	// This function will handle the "/catalog/publication/{id}/loan" route
}

func catalog(w http.ResponseWriter, r *http.Request) {
	// Implementation for the catalog handler
	// This function will handle the "/catalog" route
}

func publication(w http.ResponseWriter, r *http.Request) {
	// Implementation for the publication handler
	// This function will handle the "/catalog/publication/{id}" route
}

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Check if the user is authenticated
		if !IsUserAuthenticated(r) {
			http.Redirect(w, r, "/signin", http.StatusFound)
			return
		}

		// If authenticated, call the next handler
		next.ServeHTTP(w, r)
	})
}

func IsUserAuthenticated(r *http.Request) bool {
	// Implement your authentication logic here
	// Check if the user is authenticated based on the session, token, or any other authentication mechanism

	// For the purpose of this example, we assume the user is authenticated if there is a session cookie
	_, err := r.Cookie("session")
	return err == nil
}

func Rooter() {

	r := chi.NewRouter()
	r.Use(middleware.CleanPath)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Serve static files from the "static" directory
	r.Handle("/static/*", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	// Public Routes
	r.Group(func(r chi.Router) {
		r.Get("/", func(w http.ResponseWriter, r *http.Request) {
			http.Redirect(w, r, "/index", http.StatusFound)
		})
		r.Get("/index", func(w http.ResponseWriter, r *http.Request) {
			http.ServeFile(w, r, "static/index.html")
		})
		r.Get("/catalog", catalog)
		r.Get("/catalog/publication/{id}", publication)
	})

	// Public signin/signout/signup
	r.Group(func(r chi.Router) {
		r.Get("/signin", signin)
		r.Get("/signout", signout)
		r.Get("/signup", signup)
	})

	// Private Routes
	// Require Authentication
	r.Group(func(r chi.Router) {
		r.Use(AuthMiddleware)
		r.Get("/user/infos", userInfos)
		r.Get("/user/bookshelf", userInfos)
		r.Get("/catalog/publication/{id}/buy", publicationBuyAction)
		r.Post("/catalog/publication/{id}/loan", publicationLoanAction)
	})

	// // api Routes CRUD Publication
	// // Require Authentication
	// r.Group(func(r chi.Router) {
	// 	r.Use(AuthMiddleware)
	// 	r.Get("/api/v1/publication/{id}", apiV1PublicationGet)
	// 	r.Post("/api/v1/publication/{id}", apiV1PublicationPost)
	// 	r.Put("/api/v1/publication/{id}", apiV1PublicationPut)
	// 	r.Delete("/api/v1/publication/{id}", apiV1PublicationDelete)
	// })

	// // api Routes CRUD User
	// // Require Authentication
	// r.Group(func(r chi.Router) {
	// 	r.Use(AuthMiddleware)
	// 	r.Get("/api/v1/user/{id}", apiV1UserGet)
	// 	r.Post("/api/v1/user/{id}", apiV1UserPost)
	// 	r.Put("/api/v1/user/{id}", apiV1UserPut)
	// 	r.Delete("/api/v1/user/{id}", apiV1UserDelete)
	// })

	// Start the server on port 8080
	log.Println("Server started on port 8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}

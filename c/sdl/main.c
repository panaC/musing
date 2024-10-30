#include <SDL2/SDL.h>
#include <stdlib.h>
#include <stdio.h>

/* Very simple thread - counts 0 to 9 delaying 50ms between increments */
static int TestThread(void *ptr)
{
    int cnt;

    for (cnt = 0; cnt < 10; ++cnt) {
        printf("Thread counter: %d\n", cnt);
        SDL_Delay(50);
        printf(" > ");
        fflush(stdout);
        while (getchar() != '\n') {};
    }

    return cnt;
}

int main(int argc, char *argv[])
{
    SDL_Window* fenetre;
    SDL_Renderer* renderer; // Déclaration du renderer

    SDL_Rect cases[32]; // Déclaration du tableau contenant les cases blanches
    SDL_Point ligne_depart,ligne_arrivee; // Déclaration du point de départ et du point d'arrivée d'une ligne


    SDL_Thread *thread;
    int         threadReturnValue;

    thread = SDL_CreateThread(TestThread, "TestThread", (void *)NULL);
    if (!thread) printf("thread error\n");


    if(SDL_VideoInit(NULL) < 0) // Initialisation de la SDL
    {
        printf("Erreur d'initialisation de la SDL : %s",SDL_GetError());
        return EXIT_FAILURE;
    }

// Création de la fenêtre :
    fenetre = SDL_CreateWindow("Une fenetre SDL" , SDL_WINDOWPOS_CENTERED , SDL_WINDOWPOS_CENTERED , 800 , 800 , 0);
    if(fenetre == NULL) // Gestion des erreurs
    {
        printf("Erreur lors de la creation d'une fenetre : %s",SDL_GetError());
        return EXIT_FAILURE;
    }

// Création du renderer :
    renderer = SDL_CreateRenderer(fenetre, -1, SDL_RENDERER_ACCELERATED | SDL_RENDERER_PRESENTVSYNC); // Création du renderer
    if(renderer == NULL) // Gestion des erreurs
    {
        printf("Erreur lors de la creation d'un renderer : %s",SDL_GetError());
        return EXIT_FAILURE;
    }

// On s'occupe tout d'abord des cases de l'échiquier
    SDL_SetRenderDrawColor(renderer,0,0,0,255);
    SDL_RenderClear(renderer);
// Le fond est à présent noir

    SDL_SetRenderDrawColor(renderer,255,255,255,255); //Couleur blanche

// Nous allons maintenant remplir les cases blanches par dessus le fond noir
// Remplissage du tableau de SDL_Rect que l'on remplira ensuite avec du blanc :

    cases[0].x = cases[0].y = 0;
    cases[0].w = cases[0].h = 100;


    for(int i = 1; i != 32; i++)
    {
        cases[i].x = cases[i-1].x + 200;
        cases[i].y = cases[i-1].y;

        if(i%4 == 0) //retour à la ligne
        {
            cases[i].x = (i%8 == 0) ? 0 : 100;
            cases[i].y = cases[i-1].y + 100;
        }
        cases[i].w = cases[i].h = 100; //taille d'une case : 100 x 100
    }


    if(SDL_RenderFillRects(renderer,cases,32) <0)//Remplissage des cases blanches
    {
        printf("Erreur lors des remplissages de rectangles: %s",SDL_GetError());
        return EXIT_FAILURE;
    }

// À présent, occupons nous des lignes
// On ne peut pas utiliser la fonction SDL_RenderDrawLines
// car celle-ci ne permet pas de créer des lignes indépendantes comme nous voulons le faire mais des chemins

    SDL_SetRenderDrawColor(renderer,255,0,0,255);//Couleur rouge

// Lignes horizontales
    ligne_depart.x = 0;
    ligne_arrivee.x = 800;
    ligne_depart.y = 0;
    for(int i = 0; i!=7; i++)
    {
        ligne_depart.y += 100;
        ligne_arrivee.y = ligne_depart.y;
        SDL_RenderDrawLine(renderer,ligne_depart.x, ligne_depart.y,ligne_arrivee.x,ligne_arrivee.y);
    }

// Lignes verticales
    ligne_depart.x = 0;
    ligne_depart.y = 0;
    ligne_arrivee.y = 800;
    for(int i = 0; i!=7; i++)
    {
        ligne_depart.x += 100;
        ligne_arrivee.x = ligne_depart.x;
        SDL_RenderDrawLine(renderer,ligne_depart.x, ligne_depart.y,ligne_arrivee.x,ligne_arrivee.y);
    }

// Toujours penser au rendu, sinon on n'obtient rien du tout
    SDL_RenderPresent(renderer);
    SDL_RenderPresent(renderer);
    SDL_RenderPresent(renderer);
    SDL_SetRenderDrawColor(renderer,255,0,0,255);//Couleur rouge
                                                 //
    SDL_Rect a = {.x = 0, .y = 0, .w = 100, .h = 100};
    SDL_RenderFillRects(renderer,&a, 32);

    SDL_RenderPresent(renderer);

int isquit = 0;
SDL_Event event;
while (!isquit) {
    if (SDL_PollEvent( & event)) {
        if (event.type == SDL_QUIT) {
            if (thread) {
              SDL_DetachThread(thread);
              thread = NULL;
            }
            isquit = 1;
        }
    }
}

// Destruction du renderer et de la fenêtre :
    SDL_DestroyRenderer(renderer);
    SDL_DestroyWindow(fenetre);
    SDL_Quit(); // On quitte la SDL
}

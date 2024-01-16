import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
import numpy as np

from keras_facile import *


# Architecture du réseau
modele = Sequential()
# Couches de neurones
modele.add(Dense(2, input_dim=1, activation='relu'))
modele.add(Dense(1, activation='relu'))

# Poids de la couche 0
# definir_poids(modele,couche,rang,coeff,biais)
definir_poids(modele,0,0,1,-1)
definir_poids(modele,0,1,-0.5,1)
affiche_poids(modele,0) # affiche poids de la couche 0
# Poids de la couche 1
definir_poids(modele,1,0,[1,1],0)
affiche_poids(modele,1)
# Evaluation
entree = 3
sortie = evaluation(modele,entree)
print('Entrée :',entree,'Sortie :',sortie)
# Affichage graphique
# affichage_evaluation_une_var(modele,-2,3)

# Set the input tensor
input_tensor = tf.constant([[3.0], [3.0]], dtype=tf.float32)

# Define the weights and biases for the first layer
weights_layer1 = tf.constant([[1.0, -0.5]], dtype=tf.float32)
biases_layer1 = tf.constant([-1.0, 1.0], dtype=tf.float32)

# Define the first layer
layer1 = tf.nn.bias_add(tf.matmul(input_tensor, weights_layer1), biases_layer1)
layer1 = tf.nn.relu(layer1)
print(layer1)

# Define the weights and biases for the second layer
weights_layer2 = tf.constant([[1.0, 1.0], [1.0, 1.0]], dtype=tf.float32)
print(weights_layer2)
biases_layer2 = tf.constant([0.0, 0.0], dtype=tf.float32)

# Define the second layer
layer2 = tf.nn.bias_add(tf.matmul(layer1, weights_layer2), biases_layer2)
layer2 = tf.nn.relu(layer2)

# Define the output tensor
output_tensor = layer2
print(output_tensor)


# IRP_typicality

## Overview 
This experiment shows images to participants and asks how typical that object is of its category in general. 
For example, "how typical is this clock of clocks in general?" when the participant is shown an image of a clock. 
Participants rate this objects on a scale from 1 to 5, 1 being very typical and 5 being very atypical. 

Trial order is randomized for each participant. Each participant sees one of four collections of 125 trials based on their condiiton number (assigned in experiment URL). 

Catch trials are included -- for example: "How typical is this dog of clocks in general?" when the participant is shown an image of a dog. 

Before the typicality ratings, participants are asked a few demographics questions, and at the end of the experiment they are given a generated code to input into mturk for reimbursement. 

Data is saved directly to OSF at the end of the experiment. 

## Data structures

### image-list.js 

**imageList**: an array of strings representing the file locations for all images to be shown in the experiment

**categoryPlurals**: an array of image_file category name: plural category for prompt for every image. 
  * i.e. abacus1.png image file --> "abacus: abacuses" in the categoryMapping array
  * this category mapping array must be in the order of the files in the images directory. 

**categoryMappings**: an array of image_file category name: singular category for prompt for every image. 
  * i.e. telephonebox1.png image file --> "telephonebox: telephone box" in the categoryMapping array
  * this category mapping array must be in the order of the files in the images directory. 

### catch_trials.js 

**catchTrialImages**: an array of strings representing the file locations for all images to be shown in the experiment

**catchPlurals**: an array of image_file category name: plural category for prompt for every image. 
  * i.e. abacus1.png image file --> "abacus: abacuses" in the categoryMapping array
  * this category mapping array must be in the order of the files in the images directory. 

**catchSingulars**: an array of image_file category name: singular category for prompt for every image. 
  * i.e. telephonebox1.png image file --> "telephonebox: telephone box" in the categoryMapping array
  * this category mapping array must be in the order of the files in the images directory. 


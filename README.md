# IRP_typicality

## Overview 
This experiment shows images to participants and asks how typical that object is of its category in general. 
For example, "how typical is this object of clocks in general?" when the participant is shown an image of a clock. 
Participants rate this objects on a scale from 1 to 5, 1 being very typical and 5 being very atypical. 

Trial order is randomized for each participant. 

TO DO: Catch trials are included -- for example: "How typical is this object of clocks in general?" when the participant is shown an image of a dog. 

After the typicality ratings, participants are asked a few demographics questions, and are finally given a generated code to input into mturk for reimbursement. 

Data is saved directly to OSF at the end of the experiment. 

## Data structures

### image-list.js 

**imageList**: an array of strings representing the file locations for all images to be shown in the experiment
**categoryMappings**: an array of image_file category name: plural category for prompt for every image. 
  * i.e. abacus1.png image file --> abacus: abacuses in the categoryMapping array
  * this category mapping array must be in the order of the files in the images directory. 

These data structures are read into the experiment.js file as the list of images and their plural mappings for participats to see. 

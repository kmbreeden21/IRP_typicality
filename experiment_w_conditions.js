/////// FUNCTION DECLARATIONS ///////

// Function to generate a random string of specified length
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Function to get URL parameters
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Function to extract all categories from a list of image names
function extractAllCategories(image_path_list, plural) {

    const resultList = [];

    for (let i = 0; i < image_path_list.length; i++) {
    const processedImg = extractCategory(image_path_list[i], plural);
    resultList.push(processedImg);
    }

    // console.log(resultList) // Debug log
    return resultList;

}

// Function to extract a category from image filename 
function extractCategory(imagePath, plural) {
    // console.log('Processing image:', imagePath); // Debug log
    
    // Extract filename from path and remove extension
    const filename = imagePath.split('/').pop().replace(/\.(png|jpg|jpeg)$/i, '');
    
    // Remove numbers and get base category name
    let category = filename.replace(/\d+$/, ''); // Remove trailing numbers
    
    // console.log('Extracted category:', category); // Debug log
    
    // Use mapping if available, otherwise return cleaned category
    if (plural == true) {
        finalCategory = categoryPlurals[category];
    } else {
        finalCategory = categoryMappings[category];
    }
    
    // console.log('Final category:', finalCategory); // Debug log
    
    return finalCategory;
}


/////// GENERATE REQUIRED STRUCTURES FOR EXPERIMENT ///////

// Generate participant ID and completion code for participant to add to mturk
let participant_id = `participant${Math.floor(Math.random() * 999) + 1}`;
const completion_code = generateRandomString(3) + 'zvz' + generateRandomString(3);

// Get MTurk Worker ID and condition from URL
const workerId = getUrlParam('workerId');
const condition = getUrlParam('condition');

if (!workerId) {
    console.error('No worker ID found in URL');
}

if (!condition) {
    console.error('No condition found in URL. Please add ?condition=1, ?condition=2, ?condition=3, or ?condition=4 to the URL');
}

// Initialize filename based on workerId
const filename = `${workerId}.csv`;

// Function to divide trials into four equal parts based on condition
function getTrialsForCondition(fullImageList, conditionNumber) {
    const totalTrials = fullImageList.length;
    const trialsPerCondition = Math.floor(totalTrials / 4);
    console.log("Total trials: ", totalTrials, " and trials per condition: ", trialsPerCondition)

    const remainder = totalTrials % 4;
    
    let startIndex, endIndex;
    
    if (conditionNumber == 1) {
        startIndex = 0;
        endIndex = trialsPerCondition + (remainder > 0 ? 1 : 0);
    } else if (conditionNumber == 2) {
        startIndex = trialsPerCondition + (remainder > 0 ? 1 : 0);
        endIndex = startIndex + trialsPerCondition + (remainder > 1 ? 1 : 0);
    } else if (conditionNumber == 3) {
        startIndex = trialsPerCondition * 2 + (remainder > 0 ? 1 : 0) + (remainder > 1 ? 1 : 0);
        endIndex = startIndex + trialsPerCondition + (remainder > 2 ? 1 : 0);
    } else if (conditionNumber == 4) {
        startIndex = trialsPerCondition * 3 + (remainder > 0 ? 1 : 0) + (remainder > 1 ? 1 : 0) + (remainder > 2 ? 1 : 0);
        endIndex = totalTrials;
    } else {
        console.error('Invalid condition number. Must be 1, 2, 3, or 4');
        startIndex = 0;
        endIndex = totalTrials;
    }
    
    console.log(`Condition ${conditionNumber}: trials ${startIndex} to ${endIndex-1} (${endIndex-startIndex} trials total)`);
    return fullImageList.slice(startIndex, endIndex);
}

// Determine trial list based on condition and test status
let conditionedImageList;
console.log("Image_list length: ", imageList.length)

if (workerId.startsWith("Test")) {
    // For test runs, still use first 10 stimuli regardless of condition
    conditionedImageList = imageList.slice(0, 10);
    console.log("Test Run - using first 10 trials regardless of condition");
    console.log(`Test condition: ${condition}`);
} else {
    // Get trials for the specified condition
    const conditionNum = parseInt(condition);
    if (conditionNum >= 1 && conditionNum <= 4) {
        conditionedImageList = getTrialsForCondition(imageList, conditionNum);
        console.log(`Production run - Condition ${conditionNum}`);
    } else {
        console.error('Invalid condition parameter. Using all trials as fallback.');
        conditionedImageList = imageList;
    }
}

// Generate category list for the conditioned image list
category_list = extractAllCategories(conditionedImageList, true);
image_list = conditionedImageList;

console.log(`Worker ID: ${workerId}`);
console.log(`Condition: ${condition}`);
console.log(`Number of trials assigned: ${image_list.length}`);

/////// INITIALIZE JSPSYCH EXPERIMENT ///////

// Initialize jsPsych with MTurk worker ID
const jsPsych = initJsPsych({
    on_finish: function() {
        console.log('Experiment finished');
        console.log('Worker ID:', workerId);
        console.log('Completion Code:', completion_code);
        console.log('Number of trials:', jsPsych.data.get()
            .filter({trial_type: 'image-button-response'})
            .count());
    }
});

// Add all IDs to jsPsych data properties
jsPsych.data.addProperties({
    participant_id: participant_id,
    workerId: workerId,
    completion_code: completion_code,
    condition: condition
});

// A page that tells participants they will be moving into a fullscreen 
const fullscreen_trial = {
    type: jsPsychFullscreen,
    fullscreen_mode: true,
    delay_after: 0,
    button_label: null,
    message: null
};

// A page that moves participants out of fullscreen
const end_fullscreen = {
    type: jsPsychFullscreen,
    fullscreen_mode: false,
    button_label: null,
    message: null
};

// Updated LupyanLab consent (up to date as of June 2025)
const consent = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div style="width: 800px; margin: 0 auto; text-align: left">
            <h3>Consent to Participate in Research</h3>
            
            <p>The task you are about to do is sponsored by University of Wisconsin-Madison. It is part of a protocol titled "What are we learning from language?"</p>

            <p>The task you are asked to do involves making simple responses to words and sentences. For example, you may be asked to rate a pair of words on their similarity or to indicate how true you think a given sentence is. More detailed instructions for this specific task will be provided on the next screen.</p>

            <p>This task has no direct benefits. We do not anticipate any psychosocial risks. There is a risk of a confidentiality breach. Participants may become fatigued or frustrated due to the length of the study.</p>

            <p>The responses you submit as part of this task will be stored on a sercure server and accessible only to researchers who have been approved by UW-Madison. Processed data with all identifiers removed could be used for future research studies or distributed to another investigator for future research studies without additional informed consent from the subject or the legally authorized representative.</p>

            <p>You are free to decline to participate, to end participation at any time for any reason, or to refuse to answer any individual question without penalty or loss of earned compensation. We will not retain data from partial responses. If you would like to withdraw your data after participating, you may send an email lupyan@wisc.edu or complete this form which will allow you to make a request anonymously.</p>

            <p>If you have any questions or concerns about this task please contact the principal investigator: Prof. Gary Lupyan at lupyan@wisc.edu.</p>

            <p>If you are not satisfied with response of the research team, have more questions, or want to talk with someone about your rights as a research participant, you should contact University of Wisconsin's Education Research and Social & Behavioral Science IRB Office at 608-263-2320.</p>

            <p><strong>By clicking the box below, I consent to participate in this task and affirm that I am at least 18 years old.</strong></p>
        </div>
    `,
    choices: ['I Agree', 'I Do Not Agree'],
    data: {
        trial_type: 'consent'
    },
    on_finish: function(data) {
        if(data.response == 1) {
            jsPsych.endExperiment('Thank you for your time. The experiment has been ended.');
        }
    }
};

let continue_x =
    "<div class='right small'>(press 'x' to continue)</div>";

var instructions = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<p class="lead">In this HIT, you will see various images of familiar objects. For each image, please rate how typical it is of its category.
              For example, you may be shown a motorcycles and asked how typical it is of motorcyles in general. You may be shown a plate and asked how typical it is of plates in general.
              </p> <p class="lead">Use the  1-5 keys on the keyboard to respond. 1 means very typical. 5 means very atypical. Please try to use the entire scale, not just the 1/5 keys. If you rush through without attending to the images, we may deny payment.
              </p> ${continue_x}`, 
    choices: ['x']
    // data: {
    //     task: 'instructions',
    //     trial_type: 'instruction'
    // }
};


/////// STIMULUS TRIALS AND STRUCTURE ///////

// Create paired image-category objects
var images_paired = [];
for (let i = 0; i < image_list.length; i++) {
    images_paired.push({
        image: image_list[i],
        category: category_list[i]
    });
}

// Now shuffle the paired objects to randomize the order
var images_random = jsPsych.randomization.shuffle(images_paired);


// Modified trial to support both button clicks AND keyboard responses
var trial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function() {
        const imageUrl = jsPsych.timelineVariable('image');
        const category = jsPsych.timelineVariable('category');
        const image_name = extractCategory(jsPsych.timelineVariable('image'), false);
        console.log(image_name)
        console.log(imageUrl);
        return `
            <div style="text-align: center;">
                <img src="${imageUrl}" style="max-width: 400px; max-height: 400px; margin-bottom: 20px;">
                <p style="font-size: 18px; margin-bottom: 20px;">How typical is this <strong>${image_name}</strong> of <strong>${category}</strong> in general?</p>
                <p style="font-size: 14px; margin-bottom: 20px; color: #666;">Click a button below or press keys 1-5 on your keyboard</p>
            </div>
        `;
    },
    choices: ['1<br>Very Typical', '2<br>Typical', '3<br>Neutral', '4<br>Atypical', '5<br>Very Atypical'],
    button_html: '<button class="jspsych-btn" style="padding: 15px 25px; font-size: 16px; margin: 5px; width: 120px; height: 60px; border: 3px solid #333; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; text-align: center; vertical-align: top;">%choice%</button>',
    data: {
        task: 'typicality_rating',
        trial_type: 'main_trial',
        category: jsPsych.timelineVariable('category'),
        image: jsPsych.timelineVariable('image')
    },
    on_load: function() {
        // Add keyboard event listener for keys 1-5
        const keyListener = function(e) {
            if (e.key >= '1' && e.key <= '5') {
                // Simulate button click for the corresponding choice
                const buttonIndex = parseInt(e.key) - 1;
                const buttons = document.querySelectorAll('.jspsych-btn');
                if (buttons[buttonIndex]) {
                    buttons[buttonIndex].click();
                }
            }
        };
        
        document.addEventListener('keydown', keyListener);
        
        // Store the listener so we can remove it later
        jsPsych.getCurrentTrial().keyListener = keyListener;
    },
    on_finish: function(data) {
        // Remove the keyboard event listener
        if (jsPsych.getCurrentTrial().keyListener) {
            document.removeEventListener('keydown', jsPsych.getCurrentTrial().keyListener);
        }
        
        // Convert button response (0-4) to rating scale (1-5)
        data.rating = data.response + 1;
        
        // Store which input method was used (we can't directly detect this, 
        // but we could add logic to track it if needed)
    }
};

// Define list of trials. (Feed the shuffled images into the timeline trial structure)
var trials_with_variables = {
    timeline: [trial],
    timeline_variables: images_random
};


/////// DEFINE POST EXPERIMENT TRIALS ///////

// Define trial to give completion code to participant and to tell them they will complete a final survey 
const completion_code_trial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function() {
        return `
            <p>You have completed the main experiment!</p>
            <p>Your completion code is: <strong>${completion_code}</strong></p>
            <p>Please make a note of this code - you will need to enter it in MTurk to receive payment.</p>
            <p>Thank you so much for you participation! </p>
        `;
    },
    choices: ['End Experiment'],
    data: {
        trial_type: 'completion'
    }
};

////// TO DO: ADD DEMOGRAPHICS BLOCK HERE //////
// Demographics trials converted to jsPsych format

const demographics_gender = {
    type: jsPsychHtmlButtonResponse,
    stimulus: '<p>What is your gender?</p>',
    choices: ['Male', 'Female', 'Other', 'Prefer not to say'],
    data: {
        trial_type: 'demographics',
        question: 'gender'
    },
    on_finish: function(data) {
        // Store the response text based on the response index
        const choices = ['Male', 'Female', 'Other', 'Prefer not to say'];
        data.response_text = choices[data.response];
        jsPsych.data.addProperties({
            gender: choices[data.response]
        });
    }
};

const demographics_native = {
    type: jsPsychHtmlButtonResponse,
    stimulus: '<p>Are you a native English speaker?</p>',
    choices: ['Yes', 'No'],
    data: {
        trial_type: 'demographics',
        question: 'native_english'
    },
    on_finish: function(data) {
        const choices = ['Yes', 'No'];
        data.response_text = choices[data.response];
        // Store response for conditional logic
        jsPsych.data.addProperties({
            native_english: data.response === 0 ? 'Yes' : 'No'
        });
    }
};

const demographics_native_language = {
    type: jsPsychSurvey,
    pages: [
        {
            type: 'text',
            prompt: 'Please indicate your native language or languages:',
            name: 'native_language',
            required: true
        }
    ],
    data: {
        trial_type: 'demographics',
        question: 'native_language'
    },
    conditional_function: function() {
        // Only show if they answered "No" to native English
        const lastTrial = jsPsych.data.get().last(1).values()[0];
        return lastTrial.response === 1; // 1 = "No"
    }
};


const demographics_other_languages = {
    type: jsPsychSurveyText,
    questions: [
        {
            prompt: "What other languages do you speak? Please enter 'none' if just English.",
            name: 'other_languages',
            required: true
        }
    ],
    data: {
        trial_type: 'demographics',
        question: 'other_languages'
    }
};

const demographics_age = {
    type: jsPsychSurveyText,
    questions: [
        {
            prompt: 'How old are you?',
            name: 'age',
            required: true
        }
    ],
    data: {
        trial_type: 'demographics',
        question: 'age'
    }
};

const demographics_education = {
    type: jsPsychHtmlButtonResponse,
    stimulus: '<p>What is the highest degree or level of school you have completed? If currently enrolled, indicate highest degree received.</p>',
    choices: [
        'Less than high school',
        'High school diploma', 
        'Some college, no degree',
        "Associate's degree",
        "Bachelor's degree",
        'PhD, law, or medical degree',
        'Prefer not to say'
    ],
    data: {
        trial_type: 'demographics',
        question: 'education'
    },
    on_finish: function(data) {
        const choices = [
            'Less than high school',
            'High school diploma', 
            'Some college, no degree',
            "Associate's degree",
            "Bachelor's degree",
            'PhD, law, or medical degree',
            'Prefer not to say'
        ];
        data.response_text = choices[data.response];
    }
};

const demographics_comments = {
    type: jsPsychSurveyText,
    questions: [
        {
            prompt: 'If you have any comments for us, please enter them here:',
            name: 'comments',
            required: false,
            rows: 3
        }
    ],
    data: {
        trial_type: 'demographics',
        question: 'comments'
    }
};

// Create demographics timeline with conditional native language question
const demographics_timeline = {
    timeline: [
        demographics_gender,
        demographics_native,
        {
            timeline: [demographics_native_language],
            conditional_function: function() {
                // Show native language question only if they answered "No" to being native English speaker
                const nativeResponse = jsPsych.data.get().filter({question: 'native_english'}).values();
                if (nativeResponse.length > 0) {
                    return nativeResponse[nativeResponse.length - 1].response === 1; // 1 = "No"
                }
                return false;
            }
        },
        demographics_other_languages,
        demographics_age,
        demographics_education
        // demographics_comments
    ]
};

const comments_trial = {
    timeline: [demographics_comments]
}
/////// CONFIGURE THE DATA SAVING STEP ///////

// Configure data saving 
const save_data = {
    type: jsPsychPipe,
    action: "save",
    experiment_id: "MNeCPpLJh3wg",
    filename: filename,
    data_string: () => jsPsych.data.get().csv(),
    on_finish: function(data) {
        console.log('DataPipe trial finished. Data object:', data);
        if (data.success) {
            console.log('✅ SUCCESS: Data saved successfully to DataPipe!');
            console.log('Filename:', filename);
            console.log('Experiment ID: MNeCPpLJh3wg');
        } else {
            console.error('❌ ERROR: Failed to save data to DataPipe');
            console.error('Error details:', data.error || 'No error details provided');
            console.error('Check your experiment ID and DataPipe connection');
        }
    }
};


/////// FINAL EXPERIMENT STRUCTURE ///////
jsPsych.run([consent, fullscreen_trial, demographics_timeline, instructions, trials_with_variables, comments_trial, save_data, end_fullscreen, completion_code_trial]);
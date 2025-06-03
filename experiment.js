var jsPsych = initJsPsych({
    on_finish: function() {
        console.log('Experiment finished');
    }
});

const subject_id = jsPsych.randomization.randomID(10);
const filename = `${subject_id}.csv`;

function extractAllCategories(image_path_list) {

    const resultList = [];

    for (let i = 0; i < image_path_list.length; i++) {
    const processedImg = extractCategory(image_path_list[i]);
    resultList.push(processedImg);
    }

    console.log(resultList)
    return resultList;

}

// Function to extract category from image filename - matched to your actual image list
function extractCategory(imagePath) {
    console.log('Processing image:', imagePath); // Debug log
    
    // Extract filename from path and remove extension
    const filename = imagePath.split('/').pop().replace(/\.(png|jpg|jpeg)$/i, '');
    
    // Remove numbers and get base category name
    let category = filename.replace(/\d+$/, ''); // Remove trailing numbers
    
    console.log('Extracted category:', category); // Debug log
    
    // Use mapping if available, otherwise return cleaned category
    const finalCategory = categoryMappings[category];
    
    console.log('Final category:', finalCategory); // Debug log
    
    return finalCategory;
}

const category_list = extractAllCategories(image_list)

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

// var images = {
//     image: image_list
// };
// var images = {
//     image: image_list,
//     category: category_list
// };

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

let continue_space =
    "<div class='right small'>(press SPACE to continue)</div>";

// var images_random = jsPsych.randomization.factorial(images);

var fixation = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '+',
    trial_duration: 500,
    response_ends_trial: false,
    data: {
        task: 'fixation',
        trial_type: 'fixation'
    }
};

// var trial = {
//     type: jsPsychImageKeyboardResponse,
//     prompt: '<p> How typical is this object of its category? "1 (Very typical)", "2", "3", "4", "5 (Very atypical)" </p>',
//     stimulus: jsPsych.timelineVariable('image_test'),
//     choices: ['1', '2', '3', '4', '5'],
//     data: {
//         task: 'typicality_rating',
//         trial_type: 'main_trial'
//     }
// };

// Fixed trial using HTML button response plugin
var trial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function() {
        const imageUrl = jsPsych.timelineVariable('image');
        const category = jsPsych.timelineVariable('category');
        console.log(imageUrl);
        return `
            <div style="text-align: center;">
                <img src="${imageUrl}" style="max-width: 400px; max-height: 400px; margin-bottom: 20px;">
                <p style="font-size: 18px; margin-bottom: 20px;">How typical is this object of <strong>${category}s</strong> in general?</p>
            </div>
        `;
    },
    choices: ['1<br>Very Typical', '2', '3', '4', '5<br>Very Atypical'],
    button_html: '<button class="jspsych-btn" style="padding: 15px 25px; font-size: 16px; margin: 5px; width: 120px; height: 60px;">%choice%</button>',
    prompt: '<p style="margin-top: 15px; color: #666; font-style: italic;">You can also use keyboard keys 1-5</p>',
    data: {
        task: 'typicality_rating',
        trial_type: 'main_trial',
        category: jsPsych.timelineVariable('category'),
        image: jsPsych.timelineVariable('image')
    },
    on_finish: function(data) {
        // Convert button response (0-4) to rating scale (1-5)
        data.rating = data.response + 1;
    }
};

var trials_with_variables = {
    timeline: [fixation, trial],
    timeline_variables: images_random
};

var instructions = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<p class="lead">In this HIT, you will see various images of familiar objects. For each image, please rate how typical it is of its category.
              For example, you may be shown a motorcycles and asked how typical it is of motorcyles in general. You may be shown a plate and asked how typical it is of plates in general.
              </p> <p class="lead">Use the  1-5 keys on the keyboard to respond. 1 means very typical. 5 means very atypical. Please try to use the entire scale, not just the 1/5 keys. If you rush through without attending to the images, we may deny payment.
              </p> ${continue_space}`,
    data: {
        task: 'instructions',
        trial_type: 'instruction'
    }
};

// let instructions = {
//     type: "instructions",
//     key_forward: "space",
//     key_backward: "backspace",
//     pages: [
//       /*html*/ `<p class="lead">In this HIT, you will see various images of familiar objects. For each image, please rate how typical it is of its category.
//             For example, you may be shown a series of motorcycles and asked how typical each one is of motorcyles in general.
//             </p> <p class="lead">Use the  1-5 keys on the keyboard to respond. 1 means very typical. 5 means very atypical. Please try to use the entire scale, not just the 1/5 keys. If you rush through without attending to the images, we may deny payment.
//             </p> ${continue_space}`
//     ]
//   };

// Add subject ID to all data
jsPsych.data.addProperties({
    subject_id: subject_id
});

// Configure data saving - THIS IS THE KEY FIX
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

jsPsych.run([consent, instructions, trials_with_variables, save_data]);
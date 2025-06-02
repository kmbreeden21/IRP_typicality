var jsPsych = initJsPsych({
    on_finish: function() {
        console.log('Experiment finished');
    }
});

const subject_id = jsPsych.randomization.randomID(10);
const filename = `${subject_id}.csv`;

var images = {
    image: ['images/clock1.png', 'images/clock2.png', 'images/clock3.png']
};

var images_random = jsPsych.randomization.factorial(images);

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

var trial = {
    type: jsPsychImageKeyboardResponse,
    prompt: '<p>On a scale from 1 to 5 (1 being very typical and 5 being not very typical) how typical is this object of its category?</p>',
    stimulus: jsPsych.timelineVariable('image'),
    choices: ['1', '2', '3', '4', '5'],
    data: {
        task: 'typicality_rating',
        trial_type: 'main_trial'
    }
};

var trials_with_variables = {
    timeline: [fixation, trial],
    timeline_variables: images_random
};

var instructions = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: 'Welcome to the experiment!<br> You will be asked to rate the typicality of these images on a scale from 1 to 5 based on the category of image. For example, if you see an image of an apple, rate how typical this apple is of all apples.<br><br>Press any key to continue.',
    data: {
        task: 'instructions',
        trial_type: 'instruction'
    }
};

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

jsPsych.run([instructions, trials_with_variables, save_data]);

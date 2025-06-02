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
    response_ends_trial: false
};

var trial = {
    type: jsPsychImageKeyboardResponse,
    prompt: '<p>On a scale from 1 to 5 (1 being very typical and 5 being not very typical) how typical is this object of its category?</p>',
    stimulus: jsPsych.timelineVariable('image')
};

var trials_with_variables = {
    timeline: [fixation, trial],
    timeline_variables: images_random
};

var instructions = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: 'Welcome to the experiment!<br> You will be asked to rate the typicality of these images on a scale from 1 to 5 based on the category of image. For example, if you see an image of an apple, rate how typical this apple is of all apples.'
}

// Configure data saving

const save_data = {
    type: jsPsychPipe,
    action: "save",
    experiment_id: "MNeCPpLJh3wg",
    filename: filename,
    data_string: ()=>jsPsych.data.get().csv(),
    success_callback: function() {
        console.log('Data saved successfully to DataPipe');
        jsPsych.data.addProperties({
            completed: true
        });
    },
    error_callback: function(error) {
        console.error('Error saving to DataPipe:', error);
    }
  };

jsPsych.run([instructions, trials_with_variables, save_data]);
// Generated by CoffeeScript 2.0.2
// coffeelint: disable=max_line_length, indentation
var CONDITION, DEBUG, LOCAL, PARAMS, SCORE, STRUCTURE, TRIALS, calculateBonus, createStartButton, initializeExperiment, psiturk, saveData;

DEBUG = true;

LOCAL = false;

if (DEBUG) {
  console.log("X X X X X X X X X X X X X X X X X\n X X X X X DEBUG  MODE X X X X X\nX X X X X X X X X X X X X X X X X");
  CONDITION = 0;
} else {
  console.log("# =============================== #\n# ========= NORMAL MODE ========= #\n# =============================== #");
  console.log('16/01/18 12:38:03 PM');
  CONDITION = parseInt(condition);
}

if (mode === "{{ mode }}") {
  LOCAL = true;
  CONDITION = 0;
}

PARAMS = void 0;

TRIALS = void 0;

STRUCTURE = void 0;

SCORE = 0;

calculateBonus = void 0;

psiturk = new PsiTurk(uniqueId, adServerLoc, mode);

saveData = function() {
  return new Promise(function(resolve, reject) {
    var timeout;
    timeout = delay(10000, function() {
      return reject('timeout');
    });
    return psiturk.saveData({
      error: function() {
        clearTimeout(timeout);
        console.log('Error saving data!');
        return reject('error');
      },
      success: function() {
        clearTimeout(timeout);
        console.log('Data saved to psiturk server.');
        return resolve();
      }
    });
  });
};

// $(window).resize -> checkWindowSize 800, 600, $('#jspsych-target')
// $(window).resize()
$(window).on('load', function() {
  var loadTimeout, slowLoad;
  // Load data and test connection to server.
  slowLoad = function() {
    var ref;
    return (ref = $('slow-load')) != null ? ref.show() : void 0;
  };
  loadTimeout = delay(12000, slowLoad);
  return delay(300, function() {
    console.log('Loading data');
    PARAMS = {
      startTime: Date(Date.now())
    };
    psiturk.recordUnstructuredData('params', PARAMS);
    if (DEBUG) {
      createStartButton();
      return clearTimeout(loadTimeout);
    } else {
      console.log('Testing saveData');
      if (LOCAL) {
        clearTimeout(loadTimeout);
        return delay(500, createStartButton);
      } else {
        return saveData().then(function() {
          clearTimeout(loadTimeout);
          return delay(500, createStartButton);
        }).catch(function() {
          clearTimeout(loadTimeout);
          return $('#data-error').show();
        });
      }
    }
  });
});

createStartButton = function() {
  if (DEBUG) {
    initializeExperiment();
    return;
  }
  $('#load-icon').hide();
  $('#slow-load').hide();
  $('#success-load').show();
  return $('#load-btn').click(initializeExperiment);
};

initializeExperiment = function() {
  var Block, ButtonBlock, TextBlock, divider, experiment_timeline, finish, img, pre_test, prompt_resubmit, quiz, reprompt, save_data;
  $('#jspsych-target').html('');
  console.log('INITIALIZE EXPERIMENT');
  // ================================= #
  // ========= BLOCK CLASSES ========= #
  // ================================= #
  Block = class Block {
    constructor(config) {
      _.extend(this, config);
      // @_block = this  # allows trial to access its containing block for tracking state
      if (this._init != null) {
        this._init();
      }
    }

  };
  TextBlock = (function() {
    class TextBlock extends Block {};

    TextBlock.prototype.type = 'text';

    TextBlock.prototype.cont_key = [];

    return TextBlock;

  })();
  ButtonBlock = (function() {
    class ButtonBlock extends Block {};

    ButtonBlock.prototype.type = 'button-response';

    ButtonBlock.prototype.is_html = true;

    ButtonBlock.prototype.choices = ['Continue'];

    ButtonBlock.prototype.button_html = '<button class="btn btn-primary btn-lg">%choice%</button>';

    return ButtonBlock;

  })();
  //  ============================== #
  //  ========= EXPERIMENT ========= #
  //  ============================== #
  img = function(name) {
    return `<img class='display' src='static/images/${name}.png'/>`;
  };
  divider = new TextBlock({
    text: "<div class='center'>Press <code>space</code> to continue.</div>"
  });
  quiz = new Block({
    preamble: function() {
      return markdown("# Quiz\n");
    },
    type: 'survey-multi-choice',
    questions: ["What is 2+2?"],
    options: [['4', 'Not 4', 'None of the above']]
  });
  pre_test = new ButtonBlock({
    stimulus: function() {
      SCORE = 0;
      ({
        prompt: ''
      });
      psiturk.finishInstructions();
      return markdown(`# Training Completed\n\nWell done! You've completed the training phase and you're ready to\nplay *Web of Cash* for real. You will have **${test.timeline.length}\nrounds** to make as much money as you can. Remember, ${bonus_text()}\n\nOne more thing: **You must spend *at least* 7 seconds on each round.**\nIf you finish a round early, you'll have to wait until 7 seconds have\npassed.\n\nTo thank you for your work so far, we'll start you off with **$50**.\nGood luck!`);
    }
  });
  finish = new Block({
    type: 'survey-text',
    preamble: function() {
      return markdown(`# You've completed the HIT\n\nThanks for participating. We hope you had fun! Based on your\nperformance, you will be awarded a bonus of\n**$${calculateBonus().toFixed(2)}**.\n\nPlease briefly answer the questions below before you submit the HIT.`);
    },
    questions: ['Was anything confusing or hard to understand?', 'What is your age?', 'Additional coments?'],
    button: 'Submit HIT'
  });
  if (DEBUG) {
    experiment_timeline = [quiz];
  } else {
    experiment_timeline = [quiz, finish];
  }
  // ================================================ #
  // ========= START AND END THE EXPERIMENT ========= #
  // ================================================ #

  // bonus is the total score multiplied by something
  // pre_test
  // test
  // verbal_responses
  // finish
  calculateBonus = function() {
    var bonus;
    return 0;
    bonus = SCORE * PARAMS.bonusRate;
    bonus = (Math.round(bonus * 100)) / 100; // round to nearest cent
    return Math.max(0, bonus);
  };
  reprompt = null;
  save_data = function() {
    return psiturk.saveData({
      success: function() {
        console.log('Data saved to psiturk server.');
        if (reprompt != null) {
          window.clearInterval(reprompt);
        }
        return psiturk.computeBonus('compute_bonus', psiturk.completeHIT);
      },
      error: function() {
        return prompt_resubmit;
      }
    });
  };
  prompt_resubmit = function() {
    $('#jspsych-target').html("<h1>Oops!</h1>\n<p>\nSomething went wrong submitting your HIT.\nThis might happen if you lose your internet connection.\nPress the button to resubmit.\n</p>\n<button id=\"resubmit\">Resubmit</button>");
    return $('#resubmit').click(function() {
      $('#jspsych-target').html('Trying to resubmit...');
      reprompt = window.setTimeout(prompt_resubmit, 10000);
      return save_data();
    });
  };
  return jsPsych.init({
    display_element: 'jspsych-target',
    exclusions: {
      min_width: 800,
      min_height: 600
    },
    timeline: experiment_timeline,
    // show_progress_bar: true
    on_finish: function() {
      if (DEBUG) {
        return jsPsych.data.displayData();
      } else {
        psiturk.recordUnstructuredData('final_bonus', calculateBonus());
        return save_data();
      }
    },
    on_data_update: function(data) {
      console.log('data', data);
      return psiturk.recordTrialData(data);
    }
  });
};

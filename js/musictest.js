$(document).ready(function(){
  if (!window.HTMLAudioElement) {
    pageTracker._trackEvent('Trouble', 'No Audio Tag');
    $("#main").html("You do not support the audio tag. This web application requires a modern browser. Practical versions are Firefox 3.5+, Safari 3.1+, Chrome 3+, and Internet Explorer 9+ (Not 8)");
    return;
  }
  
  var path = "music/";
  var works = [];
  var workChoices = [];
  var workIndex = [];
  // count
  var correct = 0;
  var incorrect = 0;
  
  // randomize array
  function randOrd(){
    return (Math.round(Math.random())-0.5);
  }
  
  function start_test(button) {
    var id = $(button).attr("id");
    pageTracker._trackEvent('Test', 'Start', id);
    $.ajax({
      type: "GET",
      url: "tests.xml",
      dataType: "xml",
      success: function(xml) {list_works(xml, id);}
    });
  }

  function list_works(xml, id) {
    $(xml).find('test#' + id).each(function(){
      path = $(this).find("path").text();
      $(this).find("work").each(function(){
        var id = $(this).find("id").text();
        var title = $(this).find("title").text();
        works.push(new Array(id, title));
      });
    });
    for (i=0; i<works.length; i++) {
      workChoices.push(new Array(works[i][0], works[i][1]));
    }
    works.sort(randOrd);
    nextWork();
  }

  function nextWork() {
    if (works.length !== 0) {
      // pick next work
      var next = works.shift();
      setup_test(next);
    } else {
      var score = Math.round((correct / (correct + incorrect)) * 100);
      var lettergrade;
      
      if (score >= 93) {
        lettergrade = "A";
      } else if (score >= 90) {
        lettergrade = "A-";
      } else if (score >= 87) {
        lettergrade = "B+";
      } else if (score >= 83) {
        lettergrade = "B";
      } else if (score >= 80) {
        lettergrade = "B-";
      } else if (score >= 77) {
        lettergrade = "C+";
      } else if (score >= 73) {
        lettergrade = "C";
      } else if (score >= 70) {
        lettergrade = "C-";
      } else if (score >= 67) {
        lettergrade = "D+";
      } else if (score >= 60) {
        lettergrade = "D";
      } else if (score >= 0) {
        lettergrade = "F";
      }
      
      $("#main").html("<div class='letter-grade " + lettergrade + "'>" + lettergrade + "</div><div class='result'>You got " + score + "% of the listenings correct. <a href='JavaScript:window.location.reload()' class='start'>Start Over</a></div>");
      pageTracker._trackEvent('Test', 'Done', 'Test Complete', score);
    }
  }
  
  function list_tests(xml) {
    var tests = "";
    $(xml).find('test').each(function(){
      tests = tests + "<a id='" + $(this).attr("id") + "' class='test' href='#'>" + $(this).attr("title") + "</a>";
    });
    $("#main").html("<div id='desc'>This is a UWRF Music History II Listening practice test. Every time you go through this, it picks a new random set of 30 second listening excerpts.</div> " + tests);
    pageTracker._trackEvent('Test', 'Show', 'First page');
    $("a.test").click(function(e){
      e.preventDefault();

      start_test(this);
    });
  }
  
  $.ajax({
    type: "GET",
    url: "tests.xml",
    dataType: "xml",
    success: list_tests
  });
  
  $("a.start").click(function(event){
    nextWork();
    event.preventDefault();
  });
  
  function list() {
    var choices = "<div id='choices'><h2>Choices</h2><ul>";
    
    for (var i=0; i<workChoices.length; i++) {
      choices = choices + "<li><a href='#' id='" + workChoices[i][0] + "'>" + workChoices[i][1] + "</a></li>";
    }
    
    choices = choices + "</ul></div>";
    return choices;
  }
  
  function evaluate_choice(work, chosenObj, audioTag) {
    audioTag.pause();
    var chosen = $(chosenObj).attr("id");
    if (chosen == work[0]) {
      correct = correct + 1;
      $("#main").html("<div class='correct answer'>You got it right. <a class='start' href='#'>Next</a></div>");
    } else {
      incorrect = incorrect + 1;
      $("#main").html("<div class='incorrect answer'>You got it wrong. It was " + work[1] + "<a class='start' href='#'>Next</a></div>");
    }
    $("a.start").click(function(event){
      nextWork();
      event.preventDefault();
    });
  }
  
  function setup_test(work) {
    // number of seconds to play it for.
    var duration = 30;
  
    // Set up test area
    $("#main").html("<div id='test-window'><div id='progressbar'>Loading...</div><div id='utilities'></div></div>" + list());
    
    // Switch to a javascript solution
    $("#utilities").html("<audio autobuffer id='work-tag'><source src='" + path + "/mp3/" + work[0] + ".mp3' /><source src='" + path + "/ogg/" + work[0] + ".OGG' /></audio>");
    
    // randomly pick section to play
    var audioTag = $("audio#work-tag")[0];
    if (audioTag.canPlayType("audio/mpeg")) {
      audioTag.src = path + "/mp3/" + work[0] + ".mp3";
    } else if (audioTag.canPlayType("audio/ogg")) {
      audioTag.src = path + "/ogg/" + work[0] + ".OGG";
    }

    //audioTag.play();
    
    // Wait for length of file to be available
    audioTag.addEventListener("durationchange", function(){on_durationchange(audioTag, duration);}, true);
    
    $("div#choices a").click(function(){evaluate_choice(work, this, audioTag);});
  }
  
  function on_durationchange(audioTag, duration) {
    var startTime = Math.floor(Math.random()*(audioTag.duration - duration));
    
    audioTag.currentTime = startTime;
    
    audioTag.play();
    
    // create progressbar
    $("#progressbar").html("");
    $(function() {
      $("#progressbar").progressbar({
        value: 0
      });
    });
    
    audioTag.addEventListener("timeupdate", function(){on_timeupdate(audioTag, startTime, duration);}, true);
    
    runonce = 0;
  }
  
  var runonce = 0;
  function on_timeupdate(audioTag, startTime, duration) {
    // Update status
    var status = 0;
    status = audioTag.currentTime - startTime;
    status = status / 30;
    status = status * 100;
    status = parseInt(status);
    //$("#status").html(status + "%");
    $("#progressbar").progressbar("value", status);
    
    // Stop music
    if ((audioTag.currentTime > startTime + duration) && (runonce === 0)) {
      runonce = 1;
      audioTag.pause();
    }
  }
});
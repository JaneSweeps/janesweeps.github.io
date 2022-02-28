var winner = 0;
document.body.style.backgroundImage = "misc/background.jpg')";
document.body.style.zoom = 1.4;
// Loads the tick audio sound in to an audio object.
let audio = new Audio('misc/tick.mp3');


// First get the context of the canvas as the gradient is created on this.
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
// Create radial gradient (this works best with the roundness of the wheel)
// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createRadialGradient
// Many values should be the centre of the canvas. If the canvas is square can just use the height / 2.
// The remaining values are the radius of the starting circle then the radius of the ending circle.
let canvasCenter = canvas.height / 2;
// x0,y0,r0,x1,y1,r1
let radGradient = ctx.createRadialGradient(canvasCenter, canvasCenter, 50, canvasCenter, canvasCenter, 250);
// Add the colour stops - 0.0 should be the first, 1.0 the last, others in between.
radGradient.addColorStop(0, "red");
radGradient.addColorStop(0.2, "white");
radGradient.addColorStop(0.4, "purple");
radGradient.addColorStop(0.6, "white");
radGradient.addColorStop(0.8, "purple");
radGradient.addColorStop(1, "purple");

// Create new wheel object specifying the parameters at creation time.
let theWheel = new Winwheel({
    'outerRadius'     : 200,        // Set outer radius so wheel fits inside the background.
    'innerRadius'     : 28,         // Make wheel hollow so segments don't go all way to center.
    'fillStyle'       : radGradient,
    'textFillStyle'   : 'blue',
    'rotationAngle'   : -10,
    'textFontSize'    : 20,         // Set default font size for the segments.
    'textOrientation' : 'curved', // Make text vertial so goes down from the outside of wheel.
    'textAlignment'   : 'outer',    // Align text to outside of wheel.
    'numSegments'     : 8,         // Specify number of segments.
    'segments'        :             // Define segments including colour and text.
    [                               // font size and test colour overridden on backrupt segments.
        
    ],
    'animation' :           // Specify the animation to use.
    {
        'type'     : 'spinToStop',
        'duration' : 10,    // Duration in seconds.
        'spins'    : 3,     // Default number of complete spins.
        'callbackFinished' : end,
        'callbackSound'    : playSound,   // Function to call when the tick sound is to be triggered.
        'soundTrigger'     : 'pin'        // Specify pins are to trigger the sound, the other option is 'segment'.
    },
    'pins' :				// Turn pins on.
    {
        'number'     : 8,
        'fillStyle'  : 'gold',
        'outerRadius': 6,
    }
});

for (var x = 1; x < theWheel.segments.length; x ++) {
    theWheel.segments[x].text = x.toString();
}

// This function is called when the sound is to be played.
function playSound()
{
    // Stop and rewind the sound if it already happens to be playing.
    audio.pause();
    audio.currentTime = 0;

    // Play the sound.
    audio.play();
}

// Vars used by the code in this page to do power controls.
let wheelPower    = 0;
let wheelSpinning = false;

// -------------------------------------------------------
// Function to handle the onClick on the power buttons.
// -------------------------------------------------------
function powerSelected(powerLevel)
{
    // Ensure that power can't be changed while wheel is spinning.
    if (wheelSpinning == false) {
        // Reset all to grey incase this is not the first time the user has selected the power.
        document.getElementById('pw1').className = "";
        document.getElementById('pw2').className = "";
        document.getElementById('pw3').className = "";

        // Now light up all cells below-and-including the one selected by changing the class.
        if (powerLevel == 1) {
            document.getElementById('pw1').className = "pw1";
        }

        if (powerLevel == 2) {
            document.getElementById('pw2').className = "pw2";
        }

        if (powerLevel == 3) {
            document.getElementById('pw3').className = "pw3";
        }

        // Set wheelPower var used when spin button is clicked.
        wheelPower = powerLevel;

    }
}

// -------------------------------------------------------
// Click handler for spin button.
// -------------------------------------------------------
function startSpin()
{
    // Ensure that spinning can't be clicked again while already running.
    if (wheelSpinning == false) {
        theWheel.animation.spins = 10;

        // Disable the spin button so can't click again while wheel is spinning.
        document.getElementById('spin_button').src = "misc/spin_off.png";
        document.getElementById('spin_button').className = "";

        // console.log(winner);
        // Important thing is to set the stopAngle of the animation before stating the spin.
        deg = Math.floor(5000 + Math.random() * 5000);
        switch(winner)
        {
            case 1: theWheel.animation.stopAngle = 30; //3
                    break;
            case 2: theWheel.animation.stopAngle = 60; //6
                    break;
            default: theWheel.animation.stopAngle = deg;
        }
        winner++;
        
        // theWheel.animation.stopAngle = 290;
        // Begin the spin animation by calling startAnimation on the wheel object.
        theWheel.startAnimation();

        // Set to true so that power can't be changed and spin button re-enabled during
        // the current animation. The user will have to reset before spinning again.
        wheelSpinning = true;
    }
}

// -------------------------------------------------------
// Function for reset button.
// -------------------------------------------------------
function resetWheel()
{
    // Loop and set fillStyle of all segments to gray.
    for (var x = 1; x < theWheel.segments.length; x ++) {
        theWheel.segments[x].fillStyle = radGradient;
    }
    theWheel.draw();

    theWheel.stopAnimation(false);  // Stop the animation, false as param so does not call callback function.
    theWheel.rotationAngle = 0;     // Re-set the wheel angle to 0 degrees.
    theWheel.draw();                // Call draw to render changes to the wheel.

    wheelSpinning = false;          // Reset to false to power buttons and spin can be clicked again.
}

// -------------------------------------------------------
// Called when the spin animation has finished by the callback feature of the wheel because I specified callback in the parameters.
// -------------------------------------------------------
function end(indicatedSegment)
{
    // Loop and set fillStyle of all segments to gray.
    for (var x = 1; x < theWheel.segments.length; x ++) {
        if(x == indicatedSegment.text) continue;
        theWheel.segments[x].fillStyle = '#808080';
    }
    theWheel.draw();

    drawHand();

    setTimeout(function() { alertWin(indicatedSegment); }, 5000);

    
}

function drawHand()
{
    // Create image in memory.
    let handImage = new Image();
    
    // Set onload of the image to anonymous function to draw on the canvas once the image has loaded.
    handImage.onload = function()
    {
        let handCanvas = document.getElementById('canvas');
        let ctx = handCanvas.getContext('2d');
    
        if (ctx) {
            ctx.save();
            ctx.translate(200, 150);
            ctx.rotate(theWheel.degToRad(-40));  // Here I just rotate the image a bit.
            ctx.translate(-200, -150);
            ctx.drawImage(handImage, 210, 140);   // Draw the image at the specified x and y.
            ctx.restore();
        }
    };
    
    // Set source of the image. Once loaded the onload callback above will be triggered.
    handImage.src = 'misc/pointing_hand.png';
    
}

function alertWin(indicatedSegment)
{
    document.getElementById('spin_button').src = "spin_on.png";
    document.getElementById('spin_button').className = "clickable";
    resetWheel();
    //window.location = "result.html"; // Redirecting to other page.
    window.location.href="num/"+indicatedSegment.text+".png";

}

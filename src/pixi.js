/* Global Constants */
// Represents the width of a reel in pixels
const REEL_WIDTH = 260;
// Represents the size of a symbol in pixels
const SYMBOL_SIZE = 160;
// References the Sprite class from the PIXI.js library
const Sprite = PIXI.Sprite;
// References the Texture class from the PIXI.js library
const Texture = PIXI.Texture;

// Create a new PIXI.Application instance with automatic resizing
const app = new PIXI.Application({ resizeTo: window });
// Append the application's `view` canvas element to the document's `body`
document.body.appendChild(app.view);

// Load the background image from the specified path
const background = Sprite.from("assets/images/background.png");
// Add the background sprite to the application's stage
app.stage.addChild(background);

// Create a sprite for the slot reel frame using the specified image
const slotFrame = Sprite.from("assets/images/reelframe.png");
// Set the height of the slot frame to the window's inner height
slotFrame.height = window.innerHeight - 100;
// Set the width of the slot frame to the window's inner width to fill the available space
slotFrame.width = window.innerWidth;
// Add the slot frame sprite to the application's stage so it will be rendered on the screen
app.stage.addChild(slotFrame);

// Load multiple image assets using PIXI.Assets
PIXI.Assets.load([
  // List of image paths
  "assets/images/symbol00.png",
  "assets/images/symbol01.png",
  "assets/images/symbol02.png",
  "assets/images/symbol03.png",
  "assets/images/symbol04.png",
  "assets/images/symbol05.png",
  "assets/images/symbol06.png",
  "assets/images/symbol07.png",
  "assets/images/symbol08.png",
  "assets/images/symbol09.png",
  "assets/images/symbol10.png",
  "assets/images/symbol11.png",
  "assets/images/symbol12.png",
]).then(onAssetsLoaded);

/**
 * Callback function executed when all assets are loaded.
 * Sets up the slot machine reels and UI components.
 */
function onAssetsLoaded() {
  // Create an array to store the slot textures
  const slotTextures = [
    Texture.from("assets/images/symbol00.png"),
    Texture.from("assets/images/symbol01.png"),
    Texture.from("assets/images/symbol02.png"),
    Texture.from("assets/images/symbol03.png"),
    Texture.from("assets/images/symbol04.png"),
    Texture.from("assets/images/symbol05.png"),
    Texture.from("assets/images/symbol06.png"),
    Texture.from("assets/images/symbol07.png"),
    Texture.from("assets/images/symbol08.png"),
    Texture.from("assets/images/symbol09.png"),
    Texture.from("assets/images/symbol10.png"),
    Texture.from("assets/images/symbol11.png"),
    Texture.from("assets/images/symbol12.png"),
  ];

  // Create an array to store the reel data
  const reelsContainer = [];
  // Create a container to hold all reels
  const reelsGroupContainer = new PIXI.Container();

  for (let i = 0; i < 5; i++) {
    // Create a container for a single reel
    const reelBox = new PIXI.Container();

    // Create window frame
    let frame = new PIXI.Graphics();
    // Define the window frame rectangle dimensions
    frame.drawRect(0, 0, innerWidth, innerHeight - 100);
    // Add the window frame to the application stage
    app.stage.addChild(frame);

    // Create a graphics object to define the mask for the reel
    let mask = new PIXI.Graphics();
    // Define the rectangular area to show within the mask (the reel window)
    mask.beginFill(0xffffff);
    mask.drawRect(0, 0, 400, 480); // Define the rectangle dimensions
    mask.endFill(); // End filling

    // Set the mask for the reel container
    reelBox.mask = mask;
    // Add the mask as a child of the reel container
    reelBox.addChild(mask);

    frame.addChild(reelBox);
    // Position the reel container based on the current reel index
    reelBox.x = i * REEL_WIDTH + 50;
    // Add the reel container to the main reels group container
    reelsGroupContainer.addChild(reelBox);

    // Initialize reel data
    const reelInitialValues = {
      container: reelBox,
      symbols: [],
      position: 0,
      previousPosition: 0,
      blur: new PIXI.filters.BlurFilter(),
    };
    // Set initial blur filter values
    reelInitialValues.blur.blurX = 0;
    reelInitialValues.blur.blurY = 0;
    reelBox.filters = [reelInitialValues.blur];

    // Loop through 4 symbols for each reel
    for (let j = 0; j < 4; j++) {
      const symbol = new Sprite(
        // Use a random texture from the slot textures array
        slotTextures[Math.floor(Math.random() * slotTextures.length)]
      );

      // Position the symbol vertically within the reel
      symbol.y = j * SYMBOL_SIZE;
      // Scale the symbol to maintain aspect ratio within the symbol area
      symbol.scale.x = symbol.scale.y = Math.min(
        SYMBOL_SIZE / symbol.width, // Scale based on width
        SYMBOL_SIZE / symbol.height // Scale based on height
      );

      // Add the symbol to the reel's symbols array
      reelInitialValues.symbols.push(symbol);
      // Add the symbol to the reel container
      reelBox.addChild(symbol);
    }
    // Add the reel data to the main reels container array
    reelsContainer.push(reelInitialValues);
  }
  // Add the reels group container to the application stage so it is displayed on the screen
  app.stage.addChild(reelsGroupContainer);

  // Set the vertical position of the reels group container to 5 pixels from the top of the screen
  reelsGroupContainer.y = 5;
  // Calculate the horizontal position of the reels group container by subtracting the width of all five reels from the screen width
  // and rounding it to an integer value for smoother positioning
  reelsGroupContainer.x = Math.round(app.screen.width - REEL_WIDTH * 5);

  // Create a sprite object using the spin button image from the assets folder
  const spinButton = Sprite.from("assets/images/spinbtn.png");
  // Set the horizontal position of the spin button to be centered horizontally on the screen
  spinButton.x = Math.round(app.screen.width / 2 - 50);
  // Set the vertical position of the spin button to be near the bottom of the screen
  spinButton.y = app.screen.height - 95;
  // Set the height of the spin button to match its image size
  spinButton.height = 90;
  // Set the width of the spin button to match its image size
  spinButton.width = 100;
  // Disable interactivity for the spin button to prevent unintended behavior
  spinButton.eventMode = "static";
  // Change the cursor appearance when hovering over the spin button
  spinButton.cursor = "pointer";
  // Add an event listener for the "pointerdown" event on the spin button
  spinButton.addListener("pointerdown", () => {
    // Hide the winning text when the spin button is clicked
    winningText.visible = false;
    // Call the `startSpinTransition()` function to initiate the spinning animation
    startSpinTransition();
  });
  // Add the spin button to the application stage to make it visible on the screen
  app.stage.addChild(spinButton);

  // Declare a variable named `spinningTransition` to track whether the reels are currently transitioning
  let spinningTransition = false;

  /**
   * Initiates the spinning transition for the slot machine reels.
   * Checks if a spinning transition is already in progress.
   * Generates random extra time for added visual variety.
   */
  function startSpinTransition() {
    // If spinning transition is already in progress, do nothing
    if (spinningTransition) return;
    // Set spinning transition to true to prevent concurrent transitions
    spinningTransition = true;
    // Generate a random extra time for added visual variety
    const extra = Math.floor(Math.random() * 3);
    // Base time for all reels to complete the transition
    const baseTime = 3000;
    // Time increment for each reel to create differentiation
    const timeIncrement = 500;

    // Loop through each reel container to initiate transitions
    for (let i = 0; i < reelsContainer.length; i++) {
      const reel = reelsContainer[i];
      // Calculate the target position for the reel
      const target = reel.position + 10 + i * 5 + extra;
      // Calculate the transition time for the reel
      const time = baseTime + i * timeIncrement + extra * timeIncrement;
      // Initiate tween animation for the reel
      tweenTo(
        reel,
        "position",
        target,
        time,
        // Revert effect for the transition
        backout(0.5),
        null,
        // Callback for the last reel to signal completion
        i === reelsContainer.length - 1 ? reelsComplete : null
      );
    }
  }

  /**
   * Callback function executed when all slot machine reels complete their spinning transition.
   * Resets the spinning transition state to false.
   * Checks if the symbols on each reel match, indicating a successful spin.
   * If successful, displays the winning text.
   */
  function reelsComplete() {
    // Reset spinning transition state to false
    spinningTransition = false;
    // Flag to track if the spin is successful
    let isSucceeded = false;
    // Iterate through each reel to check for matching symbols
    reelsContainer.forEach((reelObj) => {
      // Check for a successful spin only if not already succeeded
      if (!isSucceeded) {
        const spritesArr = [...reelObj.symbols];

        spritesArr.splice(0, 1);
        // Extract the texture ID of the first remaining symbol
        const firstSprite = spritesArr[0]._texture.textureCacheIds[0];
        // Check if all symbols in the array have the same texture ID
        isSucceeded = spritesArr.every(
          (obj) => obj._texture.textureCacheIds[0] === firstSprite
        );
      }
    });

    // If the spin is successful, display the winning text
    if (isSucceeded) {
      winningText.visible = true;
    }
  }

  // Define text style for the winning text
  const style = new PIXI.TextStyle({
    fontFamily: "NunitoBold", // Font family for the text
    fontSize: 40, // Font size in pixels
    fontWeight: 800, // Font weight (bold)
    fill: ["#ffd800", "#ffd800"], // Fill color (gradient with two stops)
    stroke: "#000000", // Stroke color for text
    strokeThickness: 5, // Stroke thickness in pixels
    dropShadow: true, // Enable drop shadow
    dropShadowColor: "#000000", // Drop shadow color
    dropShadowBlur: 4, // Drop shadow blur amount
    wordWrap: true, // Enable word wrapping
    wordWrapWidth: 440, // Width at which to wrap text
  });

  // Create a PIXI.Text object for displaying winning text
  let winningText = new PIXI.Text("WIN $1.00", style);
  // Set the horizontal position of the winning text
  winningText.x = app.screen.width / 1.4;
  // Set the vertical position of the winning text
  winningText.y = app.screen.height - 70;
  // Make the winning text initially hidden
  winningText.visible = false;
  // Add the winning text to the PIXI application's stage
  app.stage.addChild(winningText);

  // Add a function to be called on each frame update using PIXI's ticker
  app.ticker.add(() => {
    // Update the slots for each reel in the reelsContainer.
    for (const reelsTicker of reelsContainer) {
      // Update blur filter y amount based on the speed of reel movement.
      // Note: It would be better if calculated with time in mind for smoother animation.
      // Currently, blur depends on the frame rate.

      // Calculate the blur amount based on the difference in position since the last frame
      reelsTicker.blur.blurY =
        (reelsTicker.position - reelsTicker.previousPosition) * 8;
      // Update the previous position to be used in the next frame
      reelsTicker.previousPosition = reelsTicker.position;

      // Update symbol positions on reel.
      for (let j = 0; j < reelsTicker.symbols.length; j++) {
        const reelsSymbol = reelsTicker.symbols[j];
        const prev = reelsSymbol.y;

        // Calculate the new vertical position of the symbol
        reelsSymbol.y =
          ((reelsTicker.position + j) % reelsTicker.symbols.length) *
            SYMBOL_SIZE -
          SYMBOL_SIZE;
        // Check if the symbol went over the top and needs to be swapped
        if (reelsSymbol.y < 0 && prev > SYMBOL_SIZE) {
          // Swap the texture of the symbol with a random texture from the slotTextures array
          reelsSymbol.texture =
            slotTextures[Math.floor(Math.random() * slotTextures.length)];
          // Scale the symbol to maintain aspect ratio within the SYMBOL_SIZE
          reelsSymbol.scale.x = reelsSymbol.scale.y = Math.min(
            SYMBOL_SIZE / reelsSymbol.texture.width,
            SYMBOL_SIZE / reelsSymbol.texture.height
          );
          // Center the symbol horizontally within the SYMBOL_SIZE
          reelsSymbol.x = Math.round((SYMBOL_SIZE - reelsSymbol.width) / 2);
        }
      }
    }
  });
}

// Array to store references to ongoing tweens or animations
const tweening = [];
/**
 * Tween the specified property of an object to a target value over a specified duration.
 * @param {object} object - The object whose property is being tweened.
 * @param {string} property - The property to tween.
 * @param {number} target - The target value for the property.
 * @param {number} time - The duration of the tween in milliseconds.
 * @param {function} easing - The easing function for the tween.
 * @param {function} onchange - Callback function called on property change.
 * @param {function} oncomplete - Callback function called on tween completion.
 * @returns {object} - The created tween object.
 */
function tweenTo(object, property, target, time, easing, onchange, oncomplete) {
  // Create a tween object with specified parameters
  const tween = {
    object,
    property,
    propertyBeginValue: object[property],
    target,
    easing,
    time,
    change: onchange,
    complete: oncomplete,
    start: Date.now(),
  };

  // Add the tween object to the tweening array
  tweening.push(tween);
  // Return the created tween object
  return tween;
}

/**
 * Animation loop that updates tweens and removes completed tweens from the tweening array.
 */
app.ticker.add(() => {
  // Get the current date in milliseconds
  const now = Date.now();
  // Array to store completed tweens for removal
  const remove = [];

  // Iterate through each tween in the tweening array
  for (let currentTween of tweening) {
    // Calculate the phase of the tween based on elapsed time
    const phase = Math.min(1, (now - currentTween.start) / currentTween.time);

    // Update the property value using linear interpolation (lerp) based on the easing function
    currentTween.object[currentTween.property] = lerp(
      currentTween.propertyBeginValue,
      currentTween.target,
      currentTween.easing(phase)
    );

    // Call the change callback if provided
    if (currentTween.change) currentTween.change(currentTween);

    // Check if the tween has completed (phase equals 1)
    if (phase === 1) {
      // Set the property to the target value
      currentTween.object[currentTween.property] = currentTween.target;
      // Call the complete callback if provided
      if (currentTween.complete) currentTween.complete(currentTween);
      // Add the completed tween to the removal list
      remove.push(currentTween);
    }
  }

  // Remove completed tweens from the tweening array
  for (const element of remove) {
    tweening.splice(tweening.indexOf(element), 1);
  }
});

/**
 * Linear interpolation (lerp) function to calculate intermediate values between two points.
 * @param {number} a1 - Starting point value.
 * @param {number} a2 - Ending point value.
 * @param {number} currentTween - Interpolation factor between 0 and 1.
 * @returns {number} - Interpolated value between a1 and a2.
 */
function lerp(a1, a2, currentTween) {
  // Formula for linear interpolation: a1 * (1 - t) + a2 * t
  return a1 * (1 - currentTween) + a2 * currentTween;
}

// Backout function from tweenjs.
// https://github.com/CreateJS/TweenJS/blob/master/src/tweenjs/Ease.js

/**
 * Generates an easing function with a "back out" effect.
 *
 * @param {number} amount - The strength of the back out effect.
 * @returns {Function} The easing function that calculates the easing value based on time (t).
 */
function backout(amount) {
  /**
   * @param {number} t - The time variable.
   * @returns {number} The calculated easing value.
   */
  return (t) => --t * t * ((amount + 1) * t + amount) + 1;
}

var pixelator = (function () {

  //check for drag'n'drop support
  function dndSupported() {
    var div = document.createElement('div');
    return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
  }

  //reads the input image and calculates the raster
  function calculateRaster(rasterSize, canvas, image) {
    var memoryContext, memoryCanvas, outContext, rasterSize, newYPos,
        imageData, height, width, x, y;

    var results = []; //holds pixels of the output
    var pixelPerRaster = rasterSize * rasterSize;

    newYPos = 0;
    x = y = rasterSize / 2;

    //round the new height and width
    height = parseInt(image.height / rasterSize) * rasterSize;
    width = parseInt(image.width / rasterSize) * rasterSize;

    canvas.width = width;
    canvas.height = height;

    //create a canvas in memory and retrieve the images data
    memoryCanvas = document.createElement('canvas');
    memoryCanvas.width = width;
    memoryCanvas.height = height;

    //get image data
    memoryContext = memoryCanvas.getContext("2d");
    memoryContext.drawImage(image, 0, 0, width, height);
    imageData = memoryContext.getImageData(0, 0, width, height);


    //reset array
    for(var i = 0; i < (width/rasterSize*height/rasterSize); i++) {
      results[i] = [0,0,0];
    }

    //step is 4 as data is r, g, b, alpha
    for (var i = 0; i < imageData.data.length; i += 4) {
      var line, newXPos;

      line = parseInt(i/(4*width)); //no line of orig image
      newXPos = parseInt((i-4*line*width)/(4*rasterSize)); // what raster pixel are we in (x)
      
      newYPos = parseInt(line/rasterSize); // what raster pixel are we in (y)

      //make a total for each color channel for each
      results[newXPos+(width/rasterSize)*newYPos][0] += imageData.data[i]
      results[newXPos+(width/rasterSize)*newYPos][1] += imageData.data[i+1]
      results[newXPos+(width/rasterSize)*newYPos][2] += imageData.data[i+2]
    }

    //create context for output
    outContext = canvas.getContext("2d");
    outContext.clearRect(0, 0, width, height);

    //create pixelated version
    for (var i = 0; i < results.length;i++) {
      results[i][0] = parseInt(results[i][0]/pixelPerRaster);
      results[i][1] = parseInt(results[i][1]/pixelPerRaster);
      results[i][2] = parseInt(results[i][2]/pixelPerRaster);

      outContext.fillStyle = "rgba(" + results[i][0] + "," + results[i][1] + "," + results[i][2] + ", 1.0)";
      outContext.fillRect (x-rasterSize/2, y-rasterSize/2, rasterSize, rasterSize); 
       
      x += rasterSize;
      if(x > width) {
        x = rasterSize/2;
        y += rasterSize;
      }

      outContext.fillRect (x+(i-3)*rasterSize-rasterSize/2, 3*y-rasterSize/2, rasterSize, rasterSize);
    }
  }

  function processImage(files) {
    var image_data, image, width, height, out_canvas;
    var rasterSize = 20; //rasterSize for output
    image_data = files[0];  //only take first image if there are more than one
    image = new Image();
    var urlCreator = window.URL || window.webkitURL; //http://jsfiddle.net/Jan_Miksovsky/yy7Zs/
    var imageUrl = urlCreator.createObjectURL( image_data );    
    image.src = imageUrl;  
    document.body.appendChild(image);

    //image is ready
    image.addEventListener("load", function() {
      var out_canvas = document.createElement('canvas'); //for output
      document.body.appendChild(out_canvas);
      calculateRaster(rasterSize, out_canvas, image);
    }, false);
  }

  //handles change the slider's change events
  function handleSlider(slider) {
    slider.addEventListener("change", function () {
      calculateRaster(parseInt(slider.value), document.getElementsByTagName('canvas')[0], document.getElementsByTagName('img')[0]);
    }, false);
  }
 
  return {
    testDnd: dndSupported,
    processImage: processImage,
    handleSlider: handleSlider
  };
})();
$(() => {
  const drawBoard = new DrawingBoard.Board('drawboard', {
    size: 24,
    controls: [
      'Navigation',
    ],
    enlargeYourContainer: true,
  });
  const model = new KerasJS.Model({
    filepaths: {
      model: '../model/mnist_cnn.json',
      weights: '../model/mnist_cnn_weights.buf',
      metadata: '../model/mnist_cnn_metadata.json',
    },
    filesystem: true,
  });
  const $submitBtn = $('.submit-btn');
  const $showResult = $('.classify-result');
  let result;

  $submitBtn.click(() => {
    const ctx = drawBoard.ctx;

    // Scaled to 28 x 28
    const ctxScaled = document.getElementById('input-canvas-scaled').getContext('2d');
    ctxScaled.save();
    ctxScaled.scale(28 / ctx.canvas.width, 28 / ctx.canvas.height);
    ctxScaled.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctxScaled.drawImage(ctx.canvas, 0, 0);
    const imageDataScaled = ctxScaled.getImageData(0, 0,
      ctxScaled.canvas.width, ctxScaled.canvas.height);
    ctxScaled.restore();

    // Process image data for model input
    const { data } = imageDataScaled;
    this.input = new Float32Array(784);
    for (let i = 0, len = data.length; i < len; i += 4) {
      this.input[i / 4] = ((data[i] / 255) - 1) * -1;
    }

    model.ready()
      .then(() => {
        model.predict({ input: this.input })
          .then((outputData) => {
            result = outputData.output;
            const ans = result.indexOf(Math.max(...result));
            const conf = (Math.max(...result) * 100).toFixed(2);
            console.log(result);
            console.log(ans);
            $showResult.html(`It should be a ${ans} (${conf}%).`);
          })
          .catch((err) => {
            console.error(err);
          });
        return null;
      })
      .catch((err) => {
        console.error(err);
      });
  });
});

$(() => {
  const drawBoard = new DrawingBoard.Board('drawboard', {
    size: 24,
    controls: [
      'Navigation',
    ],
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

  $submitBtn.click(() => {
    const ctx = drawBoard.ctx;
    ctx.scale(0.1, 0.1);
    console.log(ctx.getImageData(0, 0, 28, 28));
  });
});

$(() => {
  const drawBoard = new DrawingBoard.Board('drawboard', {
    size: 24,
    controls: [
      { Navigation: { back: false, forward: false } },
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
  const $showResult = $('.classify-result');
  let result = [];

  function drawMultSeries() {
    const data = google.visualization.arrayToDataTable([
      ['Digit', 'Possibility', { role: 'style' }],
      ['0', result[0], 'black'],
      ['1', result[1], 'black'],
      ['2', result[2], 'black'],
      ['3', result[3], 'black'],
      ['4', result[4], 'black'],
      ['5', result[5], 'black'],
      ['6', result[6], 'black'],
      ['7', result[7], 'black'],
      ['8', result[8], 'black'],
      ['9', result[9], 'black'],
    ]);

    const options = {
      title: 'Possibility of each digit',
      legend: { position: 'none' },
      animation: {
        duration: 300,
        easing: 'inAndOut',
        startup: true,
      },
      vAxis: {
        ticks: [0, 0.25, 0.5, 0.75, 1],
      },
    };

    const chart = new google.visualization.ColumnChart(
      document.getElementById('chart_div'));

    chart.draw(data, options);
  }

  drawBoard.ev.bind('board:stopDrawing', () => {
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
    const inputImage = new Float32Array(784);
    for (let i = 0, len = data.length; i < len; i += 4) {
      inputImage[i / 4] = ((data[i] / 255) - 1) * -1;
    }

    model.ready()
      .then(() => {
        model.predict({ input: inputImage })
          .then((outputData) => {
            result = outputData.output;
            $showResult.html(`It should be ${result.indexOf(Math.max(...result))}`);
            google.charts.load('current', { packages: ['corechart', 'bar'] });
            google.charts.setOnLoadCallback(drawMultSeries);
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

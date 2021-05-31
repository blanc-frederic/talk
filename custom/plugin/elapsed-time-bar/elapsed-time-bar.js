var ElapsedTimeBar = {
  // default value
  isPaused: false,
  isFinished: false,

  allottedTime: null,
  timeProgressBar: null,
  startTime: null,
  pauseTime: null,
  pauseTimeDuration: 0,

  /**
   * initialize elements
   */
  handleReady() {
    var config = Reveal.getConfig();

    // activate this plugin if config.allottedTime exists.
    if (!config.allottedTime) {
      console.warn('Failed to start ElapsedTimeBar plugin. "allottedTime" property is required.');
      return;
    }

    // calc barHeight from config.barHeight or page-progress container
    var barHeight;
    var pageProgressContainer = document.querySelector('.progress');
    if (config.progressBarHeight) {
      barHeight = parseInt(config.progressBarHeight, 10);

      // override height of page-progress container
      pageProgressContainer && (pageProgressContainer.style.height = barHeight + 'px');
    } else if (config.progress && pageProgressContainer) {
      // get height from page-progress container
      barHeight = pageProgressContainer.getBoundingClientRect().height;
    } else {
      // default
      barHeight = '3';
    }

    // create container of time-progress
    var timeProgressContainer = document.createElement('div');
    timeProgressContainer.classList.add('progress');
    timeProgressContainer.classList.add('progress-time');
    Object.entries({
      display: 'block',
      position: 'fixed',
      bottom: config.progress ? barHeight + 'px' : 0,
      width: '100%',
      height: (barHeight /2) + 'px'
    }).forEach(([k, v]) => {
      timeProgressContainer.style[k] = v;
    });
    document.querySelector('.reveal').appendChild(timeProgressContainer);

    // create content of time-progress
    this.timeProgressBar = document.createElement('div');
    Object.entries({
      height: '100%',
      willChange: 'width'
    }).forEach(([k, v]) => {
      this.timeProgressBar.style[k] = v;
    });
    timeProgressContainer.appendChild(this.timeProgressBar);

    // start timer
    this.start(config.allottedTime);
  },

  /**
   * update repeatedly using requestAnimationFrame.
   */
  loop() {
    if (this.isPaused) return;
    var now = +new Date();
    var elapsedTime = now - this.startTime - this.pauseTimeDuration;
    if (elapsedTime > this.allottedTime) {
      this.timeProgressBar.style.width = '100%';
      this.isFinished = true;
    } else {
      this.timeProgressBar.style.width = elapsedTime / this.allottedTime * 100 + '%';
      requestAnimationFrame(this.loop.bind(this));
    }
  },

  /**
   * start(reset) timer with new allotted time.
   * @param {number} allottedTime
   * @param {number} [elapsedTime=0]
   */
  start(allottedTime, elapsedTime = 0) {
    this.isFinished = false;
    this.isPaused = false;
    this.allottedTime = allottedTime;
    this.startTime = +new Date() - elapsedTime;
    this.pauseTimeDuration = 0;
    this.loop();
  },

  reset() {
    this.start(this.allottedTime);
  },

  pause() {
    if (this.isPaused) return;
    this.isPaused = true;
    this.pauseTime = +new Date();
  },

  resume() {
    if (!this.isPaused) return;

    // add paused time duration
    this.isPaused = false;
    this.pauseTimeDuration += new Date() - this.pauseTime;
    this.pauseTime = null;
    this.loop();
  }
};

if (Reveal.isReady()) {
  ElapsedTimeBar.handleReady();
} else {
  Reveal.addEventListener('ready', () => ElapsedTimeBar.handleReady());
}

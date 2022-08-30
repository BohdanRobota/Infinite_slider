const reviewsSliderOptions = {
  sliderWrapperClass: '.slider',
  sliderItemClass: '.slide',
  nextBtnClass: '.slide-right',
  prevBtnClass: '.slide-left',
  transition: 'transform 0.4s ease-in-out',
  autoPlay: true,
  autoPlayInterval: 3000,
};
const postSliderOptions = {
  sliderWrapperClass: '.post-slider',
  sliderItemClass: '.slide',
  nextBtnClass: '.arrow--right',
  prevBtnClass: '.arrow--left',
  transition: 'transform 0.4s ease-in-out',
  autoPlay: true,
  autoPlayInterval: 3000,
  imagesAmount: 3,
};

const INITIAL_SLIDE = 1;

function Slider(options) {
  this.options = options;
  this.slider = document.querySelector(this.options.sliderWrapperClass);
  this.sliderItems = document.querySelectorAll(`${this.options.sliderWrapperClass} ${this.options.sliderItemClass}`);
  this.prevBtn = document.querySelector(this.options.prevBtnClass);
  this.nextBtn = document.querySelector(this.options.nextBtnClass);

  this.transition = this.options.transition;
  this.itemWidth = this.sliderItems[0].clientWidth;
  this.currentSlide = INITIAL_SLIDE;
  this.autoPlayCheck = this.options.autoPlay;
  this.currentX = -this.itemWidth * this.currentSlide;

  this.start = function () {
    this.bindContext();
    this.addFirstLastClone();
    this.setEvents();

    if (this.autoPlayCheck) {
      this.autoPlayInterval = this.options.autoPlayInterval;
      this.interval = setInterval(this.autoPlay, this.autoPlayInterval);
    }
  };

  this.bindContext = function () {
    this.nextSlide = this.nextSlide.bind(this);
    this.prevSlide = this.prevSlide.bind(this);
    this.replaceClone = this.replaceClone.bind(this);
    this.autoPlay = this.autoPlay.bind(this);
    this.autoPlayStart = this.autoPlayStart.bind(this);
    this.autoPlayStop = this.autoPlayStop.bind(this);
  };

  this.swipe = function () {
    this.slider.style.transform = 'translateX(' + -this.itemWidth * this.currentSlide + 'px)';
  };

  this.addFirstLastClone = function () {
    let firstClone = this.slider.firstElementChild.cloneNode(true);
    let lastClone = this.slider.lastElementChild.cloneNode(true);
    lastClone.id = 'lastClone';
    firstClone.id = 'firstClone';
    this.slider.append(firstClone);
    this.slider.insertBefore(lastClone, this.slider.firstElementChild);
    this.sliderItems = document.querySelectorAll(`${this.options.sliderWrapperClass} ${this.options.sliderItemClass}`);
    this.swipe();
  };

  this.replaceClone = function () {
    this.setEvents();
    let currentId = this.sliderItems[this.currentSlide].id;
    if (currentId !== 'lastClone' && currentId !== 'firstClone') {
      return;
    }
    this.slider.style.transition = 'none';
    if (currentId === 'lastClone') {
      this.currentSlide = this.sliderItems.length - 2;
    } else if (currentId === 'firstClone') {
      this.currentSlide = this.sliderItems.length - this.currentSlide;
    }
    this.swipe();
  };

  this.setEvents = function () {
    this.nextBtn.addEventListener('click', this.nextSlide);
    this.prevBtn.addEventListener('click', this.prevSlide);
    this.slider.addEventListener('transitionend', this.replaceClone);
    this.slider.addEventListener('mouseover', this.autoPlayStop);
    this.slider.addEventListener('mouseout', this.autoPlayStart);
  };

  this.destroyEvents = function () {
    this.nextBtn.removeEventListener('click', this.nextSlide);
    this.prevBtn.removeEventListener('click', this.prevSlide);
    this.slider.removeEventListener('transitionend', this.replaceClone);
    this.slider.removeEventListener('mouseover', this.autoPlayStop);
    this.slider.removeEventListener('mouseout', this.autoPlayStart);
  };

  this.destroyCurrentEvents = function () {
    this.nextBtn.removeEventListener('click', this.nextSlide);
    this.prevBtn.removeEventListener('click', this.prevSlide);
  };

  this.stopEventsForSwipe = function () {
    if (this.interval) this.autoPlayStop();
    this.destroyCurrentEvents();
    this.slider.style.transition = this.transition;
  };

  this.prevSlide = function () {
    this.stopEventsForSwipe();
    this.currentSlide--;
    this.swipe();
    if (this.interval) this.autoPlayStart();
  };

  this.nextSlide = function () {
    this.stopEventsForSwipe();
    this.currentSlide++;
    this.swipe();
    if (this.interval) this.autoPlayStart();
  };

  this.autoPlay = function () {
    if (document.hidden) {
      return;
    }
    this.slider.style.transition = this.transition;
    this.currentSlide++;
    this.swipe();
  };

  this.autoPlayStop = function () {
    clearInterval(this.interval);
  };

  this.autoPlayStart = function () {
    if (document.hidden) return;
    this.interval = setInterval(this.autoPlay, this.autoPlayInterval);
  };
}



function SliderWithSwipe(options) {
  Slider.call(this, options);

  this.currentSlideWasChanged = false;

  let parentBindContext = this.bindContext;
  this.bindContext = function () {
    parentBindContext.call(this);
    this.startDrag = this.startDrag.bind(this);
    this.stopDrag = this.stopDrag.bind(this);
    this.dragging = this.dragging.bind(this);
  };

  let parentSetEvents = this.setEvents;
  this.setEvents = function () {
    parentSetEvents.call(this);
    this.slider.addEventListener('pointerdown', this.startDrag);
    window.addEventListener('pointerup', this.stopDrag);
  };

  let parentDestroyEvents = this.destroyEvents;
  this.destroyEvents = function () {
    parentDestroyEvents.call(this);
    this.slider.removeEventListener('pointerdown', this.startDrag);
    window.removeEventListener('pointerup', this.stopDrag);
  };

  let parentDestroyCurrentEvents = this.destroyCurrentEvents;
  this.destroyEvents = function () {
    parentDestroyCurrentEvents.call(this);
    window.removeEventListener('pointerup', this.stopDrag);
  };

  let parentStopEventsForSwipe = this.stopEventsForSwipe;
  this.stopEventsForSwipe = function () {
    parentStopEventsForSwipe.call(this);
    this.destroyDragging();
  };

  this.destroyDragging = function () {
    this.slider.removeEventListener('pointerdown', this.startDrag);
  };

  this.startDrag = function () {
    this.destroyDragging();
    this.autoPlayStop();
    if (this.currentSlide >= this.sliderItems.length - 1 || this.currentSlide <= 0) {
      return;
    }
    this.currentSlideWasChanged = false;
    this.clickX = event.pageX;
    this.startX = -this.itemWidth * this.currentSlide;
    this.slider.style.transition = 'none';
    window.addEventListener('pointermove', this.dragging);
  };

  this.stopDrag = function () {
    window.removeEventListener('pointermove', this.dragging);
    this.slider.style.transition = 'transform 0.3s ease-in-out';
    this.currentX = -this.currentSlide * this.itemWidth;
    this.slider.style.transform = `translate3d(${this.currentX}px,0,0)`;
  };

  this.dragging = function (event) {
    this.dragX = event.pageX;
    const dragShift = this.dragX - this.clickX;
    this.currentX = this.startX + dragShift;
    this.slider.style.transform = `translate3d(${this.currentX}px,0,0)`;
    if (this.isSwipingLeft(dragShift)) {
      this.currentSlideWasChanged = true;
      this.currentSlide = this.currentSlide - 1;
    }
    if (this.isSwipingRight(dragShift)) {
      this.currentSlideWasChanged = true;
      this.currentSlide = this.currentSlide + 1;
    }
  };
  this.isSwipingLeft = function (dragShift) {
    return dragShift > 20 && dragShift > 0 && !this.currentSlideWasChanged && this.currentSlide > 0;
  };

  this.isSwipingRight = function (dragShift) {
    return (
      dragShift < -20 &&
      dragShift < 0 &&
      !this.currentSlideWasChanged &&
      this.currentSlide < this.sliderItems.length - 1
    );
  };
}



function SliderWidthSeveralImg(options) {
  Slider.call(this, options);

  this.imagesAmount = this.options.imagesAmount - 1;

  this.addAllClones = function () {
    let countOfClones = this.imagesAmount;
    let clonNumbers = 1;
    while (countOfClones) {
      let currentClone = this.slider.children[clonNumbers].cloneNode(true);
      this.slider.append(currentClone);
      clonNumbers++;
      countOfClones--;
    }
  };

  this.addFirstLastClone = function () {
    let firstClone = this.slider.firstElementChild.cloneNode(true);
    let lastClone = this.slider.lastElementChild.cloneNode(true);
    lastClone.id = 'lastClone';
    firstClone.id = 'firstClone';
    this.slider.append(firstClone);
    this.addAllClones();
    this.slider.insertBefore(lastClone, this.slider.firstElementChild);
    this.sliderItems = document.querySelectorAll(`${this.options.sliderWrapperClass} ${this.options.sliderItemClass}`);
    this.swipe();
  };

  this.replaceClone = function () {
    this.setEvents();
    let currentId = this.sliderItems[this.currentSlide].id;
    if (currentId !== 'lastClone' && currentId !== 'firstClone') {
      return;
    }
    this.slider.style.transition = 'none';
    if (currentId === 'lastClone') {
      this.currentSlide = this.sliderItems.length - 2 - this.imagesAmount;
    } else if (currentId === 'firstClone') {
      this.currentSlide = this.sliderItems.length - this.currentSlide - this.imagesAmount;
    }
    this.swipe();
  };
}

const reviewsSlider = new SliderWithSwipe(reviewsSliderOptions);
const postSlider = new SliderWidthSeveralImg(postSliderOptions);
reviewsSlider.start();
postSlider.start();
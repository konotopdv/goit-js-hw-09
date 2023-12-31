import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { Report } from 'notiflix/build/notiflix-report-aio';

document.body.style.backgroundColor = 'blue';

const TIMER_DELAY = 1000;
let intervalId = null;
let selectedDate = null;
let currentDate = null;

const startBtn = document.querySelector('[data-start-timer]');
const dataDays = document.querySelector('[data-days]');
const dataHours = document.querySelector('[data-hours]');
const dataMinutes = document.querySelector('[data-minutes]');
const dataSeconds = document.querySelector('[data-seconds]');

const calendar = document.querySelector('#datetime-picker');

startBtn.disabled = true;

const options = {
  enableTime: true,
  time_24hr: true,
  defaultDate: new Date(),
  minuteIncrement: 1,
  onClose(selectedDates) {
    onChooseDate(selectedDates[0]);
  },
};

function onChooseDate(day) {
  selectedDate = day.getTime();
  currentDate = Date.now();
  if (selectedDate < currentDate) {
    Report.failure('Please, choose a date in the future');
  } else {
    startBtn.disabled = false;
    calendar.disabled = true;
  }
  return selectedDate;
}

const fp = flatpickr(calendar, options);

class CountdownTimer {
  constructor(
    rootSelectorDay,
    rootSelectorHours,
    rootSelectorMinutes,
    rootSelectorSeconds
  ) {
    this.rootSelectorDay = rootSelectorDay;
    this.rootSelectorHours = rootSelectorHours;
    this.rootSelectorMinutes = rootSelectorMinutes;
    this.rootSelectorSeconds = rootSelectorSeconds;
  }

  start() {
    if (intervalId) return;

    intervalId = setInterval(() => {
      currentDate = Date.now();
      let delta = selectedDate - currentDate;
      this.updateClockface(this.convertMs(delta));
      startBtn.disabled = true;
      calendar.disabled = true;

      if (delta <= 1000) {
        this.stop();
        this.updateClockface(this.convertMs(0));
      }
    }, TIMER_DELAY);
  }

  stop() {
    clearInterval(intervalId);
    this.intervalId = null;
    startBtn.disabled = true;
    calendar.disabled = false;
    return;
  }

  addLeadingZero(value) {
    return String(value).padStart(2, '0');
  }

  convertMs(ms) {
    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;

    const days = this.addLeadingZero(Math.floor(ms / day));
    const hours = this.addLeadingZero(Math.floor((ms % day) / hour));
    const minutes = this.addLeadingZero(
      Math.floor(((ms % day) % hour) / minute)
    );
    const seconds = this.addLeadingZero(
      Math.floor((((ms % day) % hour) % minute) / second)
    );

    return { days, hours, minutes, seconds };
  }

  updateClockface({ days, hours, minutes, seconds }) {
    this.rootSelectorDay.textContent = `${days}`;
    this.rootSelectorHours.textContent = `${hours}`;
    this.rootSelectorMinutes.textContent = `${minutes}`;
    this.rootSelectorSeconds.textContent = `${seconds}`;
  }
}

const timerCountdown = new CountdownTimer(
  dataDays,
  dataHours,
  dataMinutes,
  dataSeconds
);

startBtn.addEventListener('click', () => {
  timerCountdown.start();
});

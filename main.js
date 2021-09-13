const splitTemplate = (index, delta, val) => `
        <div class="split" onClick="onRecordStart(${val})">
          <div class="index">#${index + 1}</div>
          <span class="tile">${delta}</span>
          <a>Continue</a>
        </div>
      `;

const formatNumber = (val, len = 2) => `00000000${val}`.slice(-len);

const isNumeric = (str) => {
  if (typeof str != "string") return typeof str === "number";
  return !isNaN(str) && !isNaN(parseFloat(str));
};

const getSeconds = (str) => {
  let seconds = 0;
  const days = str.match(/(\d+)\s*d/);
  const hours = str.match(/(\d+)\s*h/);
  const minutes = str.match(/(\d+)\s*m/);
  const secs = str.match(/(\d+)\s*s/);
  if (days) seconds += parseInt(days[1]) * 86400;
  if (hours) seconds += parseInt(hours[1]) * 3600;
  if (minutes) seconds += parseInt(minutes[1]) * 60;
  if (secs) seconds += parseInt(secs[1]);
  return seconds;
};

// States
let isRunning = false;
let delta = 0; // in µs
let _previous = 0;
let splits = [];

let _total = 60 * 1000;
let _newTotal = 60 * 1000;

// UIS
const _time = document.querySelector("#time");
const _reset = document.querySelector("#reset");
const _start = document.querySelector("#start");
const _input = document.querySelector("#input");
const _splits = document.querySelector("#splits");

const _handleToggle = () => {
  isRunning = !isRunning;
  if (isRunning) _handleStart();
  else {
    _total = _newTotal;
  }
};

const onRecordStart = (val) => {
  _total = val;
  delta = 0;
  isRunning = true;
  _handleStart();
};

const _handleSaveCurrent = () => {
  const saves = JSON.parse(localStorage.getItem("@records") || "[]");
  saves.unshift(_total - delta);
  localStorage.setItem("@records", JSON.stringify(saves.slice(0, 10)));
  _handleRecordUIUpdate();
};

const _handleReset = () => {
  isRunning = false;
  _handleSaveCurrent();
  requestAnimationFrame(() => {
    let val = getSeconds(_input.value);
    if (isNumeric(_input.value)) val = _input.value * 60;
    _total = val * 1000;
    delta = 0;

    _handleRecordUIUpdate();
    _handleUiPrint();
  });
};

const _handleStart = () => {
  _previous = window.performance.now();
  _handlePoll();
};

const _handlePoll = () => {
  if (isRunning) requestAnimationFrame(_handlePoll);
  _start.children[0].innerText = isRunning ? "Pause" : "Start";
  _start.className = isRunning ? "start running" : "start regular";
  const now = window.performance.now();
  const _delta = now - _previous;
  delta += _delta;
  _previous = now;

  _handleUiUpdate();
};

const _getTimeFormat = (delta) => {
  const ms = delta;
  const seconds = ms / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  return `${formatNumber(Math.floor(hours))}:${formatNumber(
    Math.floor(minutes % 60)
  )}:${formatNumber(Math.floor(seconds % 60))}`;
};

const _handleAddSplit = () => {
  splits.unshift(delta);
  _handleUiUpdate();
};

let _lastUpdate;
const _handleUiUpdate = () => {
  const now = Date.now();
  if (_lastUpdate + 20 > now) return;
  _time.innerText = _getTimeFormat(_total - delta);
  _lastUpdate = now;
};

const _handleUiPrint = (time) => {
  _time.innerText = _getTimeFormat(_total);
};

const _handleRecordUIUpdate = () => {
  const saves = JSON.parse(localStorage.getItem("@records") || "[]");
  const reversedSplits = [...saves];
  _splits.innerHTML = reversedSplits
    .map((split, index) =>
      splitTemplate(index, _getTimeFormat(split || 0), split)
    )
    .join("");
};

const _handleChange = (e) => {
  let val = getSeconds(e.target.value);
  if (isNumeric(e.target.value)) val = e.target.value * 60;
  _newTotal = val * 1000;
  if (!isRunning) _total = val * 1000;
  _handleUiUpdate();
};
_handleRecordUIUpdate();
_handleUiUpdate();

_start.addEventListener("click", _handleToggle);
_reset.addEventListener("click", _handleReset);
_input.addEventListener("input", _handleChange);

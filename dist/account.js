'use strict';

let revision = account.revision;
let pending = null;
let sending = null;
let activeSave = null;
let saveBlocked = false;
let importing = false;
let savedReviewDirection = account.reviewDirection;
let directionWrite = null;

async function writeProgress(snapshot, version) {
  const response = await fetch('progress.php', {
    method: 'POST',
    headers: {'Content-Type':'application/json', 'X-CSRF-Token':account.csrf},
    body: '{"revision":' + version + ',"state":' + snapshot + '}'
  });
  if (!response.ok) {
    const error = new Error('Progress request failed');
    error.status = response.status;
    throw error;
  }
  return (await response.json()).revision;
}

function saveMessage(message, label, action) {
  const notice = document.getElementById('save-notice');
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.onclick = action;
  notice.replaceChildren(document.createTextNode(message + ' '), button);
  notice.hidden = false;
}

function reloadDashboard() {
  // A route from an old tab must not update the active account's last lesson.
  history.replaceState(null, '', '/');
  location.reload();
}

function reportSaveError(error) {
  if ([401,403,409].includes(error.status)) {
    saveBlocked = true;
    const conflict = error.status === 409;
    saveMessage(conflict
      ? 'نسخهٔ جدیدتری در پنجرهٔ دیگری ذخیره شده. تغییرات ذخیره‌نشدهٔ این صفحه با بازخوانی کنار گذاشته می‌شوند.'
      : 'حساب فعال تغییر کرده یا زمان ورود تمام شده. تغییرات این صفحه ذخیره نشد.',
      conflict ? 'بازخوانی پیشرفت حساب' : 'باز کردن حساب فعال', () => {
        sending = pending = null;
        reloadDashboard();
      });
  } else {
    saveMessage('ذخیره انجام نشد. این صفحه را باز نگه دار و دوباره تلاش کن.', 'تلاش دوباره', drainSaves);
  }
}

async function flush() {
  try {
    while (sending !== null || pending !== null) {
      if (sending === null) {
        sending = pending;
        pending = null;
      }
      revision = await writeProgress(sending, revision);
      sending = null;
    }
    document.getElementById('save-notice').hidden = true;
    return true;
  } catch (error) {
    reportSaveError(error);
    return false;
  }
}

function drainSaves() {
  if (saveBlocked) return Promise.resolve(false);
  if (!activeSave) activeSave = flush().finally(() => { activeSave = null; });
  return activeSave;
}

function save() {
  pending = JSON.stringify(state);
  return drainSaves();
}

async function signOut(button) {
  button.disabled = true;
  await directionWrite;
  if (await drainSaves()) document.getElementById('sign-out').submit();
  else button.disabled = false;
}

function applyReviewDirection(direction) {
  account.reviewDirection = direction;
  if (readRoute().page !== 'review') return;
  const keepFocus = document.activeElement?.name === 'review-direction';
  revealed = reviewResult !== null;
  render();
  if (keepFocus) $('#main input[name="review-direction"]:checked').focus({preventScroll:true});
}

async function saveReviewDirection() {
  while (savedReviewDirection !== account.reviewDirection) {
    const direction = account.reviewDirection;
    try {
      const response = await fetch('profile.php', {
        method:'POST', headers:{'X-CSRF-Token':account.csrf},
        body:new URLSearchParams({review_direction:direction})
      });
      if (!response.ok) throw Object.assign(new Error('Review direction save failed'), {status:response.status});
      savedReviewDirection = direction;
    } catch (error) {
      if (account.reviewDirection === direction) applyReviewDirection(savedReviewDirection);
      if (error.status === 401 || error.status === 403) {
        reportSaveError(error);
        return;
      }
      flash('جهت مرور ذخیره نشد. دوباره انتخاب کن.');
      return;
    }
  }
}

document.addEventListener('change', event => {
  if (event.target.name !== 'review-direction') return;
  applyReviewDirection(event.target.value);
  if (!directionWrite) directionWrite = saveReviewDirection().finally(() => { directionWrite = null; });
});

function accountName() {
  return account.displayName || account.username;
}

function applyDisplayName(name) {
  account.displayName = name;
  document.querySelectorAll('[data-account-name]').forEach(el => { el.textContent = accountName(); });
  const input = document.getElementById('display-name');
  if (input) {
    if (input.value === input.defaultValue) input.value = name ?? '';
    input.defaultValue = name ?? '';
  }
}

function profilePage() {
  let migration = '';
  if (revision === 0 && !pending && !sending) {
    const browser = store.get('lernhaus-v1-personal') ?
      '<button class="secondary" data-act="import-browser">انتقال پیشرفت همین مرورگر</button>' : '';
    migration = '<section class="panel profile-picker grid gap-3"><h2>انتقال پیشرفت قبلی</h2>' +
      '<p class="text-muted">اگر در نسخهٔ قبلی درس خواندی، فایل پیشرفت شخصی‌ات را به این حساب وارد کن.</p>' +
      browser + '<label class="grid gap-2">فایل پیشرفت <input type="file" id="progress-file" accept=".json,application/json"></label></section>';
  }
  return heading('حساب من', 'درس‌ها، آزمون‌ها و مرورهای تو با این حساب ذخیره می‌شوند.') +
    '<div class="grid gap-4"><section class="panel profile-picker grid gap-6">' +
    '<form id="profile-name-form" method="post" class="grid gap-2">' +
    '<label for="display-name"><strong>نام نمایشی</strong></label>' +
    '<input id="display-name" name="display_name" class="auth-input" dir="auto" autocomplete="nickname" ' +
    'maxlength="80" placeholder="مثلاً نیما" aria-describedby="display-name-help" value="' + esc(account.displayName ?? '') + '">' +
    '<small id="display-name-help" class="text-muted">در پیام خوش‌آمدگویی این اسم را می‌بینی. اگر خالی بگذاری، نام کاربری‌ات نمایش داده می‌شود.</small>' +
    '<div class="flex flex-wrap items-center gap-3"><button type="submit" class="primary">ذخیرهٔ نام</button>' +
    '<span role="status" class="text-sm" id="profile-name-status"></span></div></form>' +
    '<div class="profile-login flex flex-wrap items-center justify-between gap-4">' +
    '<div><span class="text-sm text-muted">نام کاربری ورود</span><h2 dir="auto">' + esc(account.username) +
    '</h2></div><button class="secondary" data-act="logout">خروج از حساب</button></div></section>' + migration + '</div>';
}

document.addEventListener('submit', async event => {
  const form = event.target;
  if (form.id !== 'profile-name-form') return;
  event.preventDefault();
  const input = form.elements.display_name;
  const button = form.querySelector('button');
  if (button.disabled) return;
  button.disabled = true;
  const submitted = input.value;
  const status = form.querySelector('[role="status"]');
  status.textContent = 'در حال ذخیره…';
  try {
    const response = await fetch('profile.php', {
      method: 'POST', headers: {'X-CSRF-Token': account.csrf},
      body: new URLSearchParams({display_name: submitted})
    });
    if (response.status === 401 || response.status === 403) {
      status.textContent = 'برای ذخیره، دوباره وارد حساب شو.';
      reportSaveError({status: response.status});
      return;
    }
    const result = await response.json();
    if (!response.ok) {
      status.textContent = result.message || 'نام ذخیره نشد. دوباره تلاش کن.';
      return;
    }
    if (input.value === submitted) input.value = result.displayName ?? '';
    applyDisplayName(result.displayName);
    status.textContent = input.value === input.defaultValue ? 'نام نمایشی ذخیره شد.' : 'تغییرات تازه هنوز ذخیره نشده‌اند.';
  } catch {
    status.textContent = 'ذخیره انجام نشد. دوباره تلاش کن.';
  } finally {
    button.disabled = false;
  }
});

document.addEventListener('input', event => {
  if (event.target.id === 'display-name') document.getElementById('profile-name-status').textContent = '';
});

async function importProgress(text, control) {
  if (revision !== 0 || sending || pending || importing || saveBlocked) return;
  importing = true;
  control.disabled = true;
  try {
    const imported = JSON.parse(text);
    if (!imported || typeof imported !== 'object') throw new Error('Invalid file');
    imported.quizzes ??= {};
    const snapshot = JSON.stringify(imported);
    revision = await writeProgress(snapshot, 0);
    location.reload();
  } catch (error) {
    if ([401,403,409].includes(error.status)) reportSaveError(error);
    else flash(error.status === 422 || error instanceof SyntaxError || error.message === 'Invalid file'
      ? 'ساختار فایل پیشرفت معتبر نیست.' : 'انتقال انجام نشد. دوباره تلاش کن.');
    control.disabled = false;
    if (control.type === 'file') control.value = '';
  } finally {
    importing = false;
  }
}

document.addEventListener('change', async event => {
  const control = event.target;
  if (control.id !== 'progress-file' || !control.files.length) return;
  const file = control.files[0];
  if (file.size > 1024 * 1024) {
    flash('اندازهٔ فایل باید کمتر از یک مگابایت باشد.');
    control.value = '';
    return;
  }
  await importProgress(await file.text(), control);
});

window.addEventListener('beforeunload', event => {
  if (sending || pending || importing || directionWrite) { event.preventDefault(); event.returnValue = ''; }
});
window.addEventListener('pageshow', event => { if (event.persisted) reloadDashboard(); });
document.addEventListener('visibilitychange', async () => {
  if (document.hidden || saveBlocked || importing) return;
  const previousName = account.displayName;
  const previousDirection = savedReviewDirection;
  try {
    const response = await fetch('progress.php', {cache:'no-store'});
    if (response.status === 401) { reloadDashboard(); return; }
    if (!response.ok) return;
    const info = await response.json();
    if (info.csrf !== account.csrf || (!sending && !pending && info.revision > revision)) reloadDashboard();
    else {
      if (previousName === account.displayName && info.displayName !== previousName) applyDisplayName(info.displayName);
      if (!directionWrite && previousDirection === savedReviewDirection && info.reviewDirection !== savedReviewDirection) {
        savedReviewDirection = info.reviewDirection;
        applyReviewDirection(savedReviewDirection);
      }
    }
  } catch { /* An active write still reports its own failure and offers retry. */ }
});

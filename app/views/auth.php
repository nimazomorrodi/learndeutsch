<main class="auth-page grid min-h-screen items-center px-4 py-6 sm:px-8">
  <div class="auth-frame mx-auto w-full">
    <header class="auth-header flex items-center justify-between gap-4">
      <a class="brand" href="/" aria-label="لرن‌هاوس"><img src="assets/mark.svg" alt=""><b lang="de">Lernhaus<span>.</span></b></a>
      <button type="button" id="auth-theme" class="theme-btn" aria-label="تغییر حالت نمایش">◐</button>
    </header>
    <section class="auth-panel overflow-hidden rounded-3xl">
      <div class="auth-content grid items-center gap-6">
        <div>
          <h1><?= $register ? 'حساب یادگیری بساز' : 'ورود به میز مطالعه' ?></h1>
          <p class="mt-2 text-muted"><?= $register ? 'یک نام کاربری برای فضای مطالعهٔ خودت انتخاب کن.' : 'وارد شو و از همان‌جایی که ماندی ادامه بده.' ?></p>
        </div>
        <form method="post" class="grid gap-4">
          <input type="hidden" name="action" value="<?= $register ? 'register' : 'login' ?>">
          <input type="hidden" name="csrf" value="<?= h($_SESSION['csrf']) ?>">
          <?php if ($error): ?><div class="auth-error" role="alert"><?= h($error) ?></div><?php endif; ?>
          <label class="grid gap-1.5 font-medium" for="username">نام کاربری
            <input class="auth-input" id="username" name="username" dir="auto" autocomplete="username" autocapitalize="none" spellcheck="false" required maxlength="40" value="<?= h($username) ?>">
          </label>
          <label class="grid gap-1.5 font-medium" for="password">رمز عبور
            <input class="auth-input" id="password" name="password" dir="auto" type="password" required <?= $register ? 'minlength="8" aria-describedby="password-help"' : '' ?> autocomplete="<?= $register ? 'new-password' : 'current-password' ?>">
          </label>
          <?php if ($register): ?><small id="password-help" class="text-muted">حداقل ۸ نویسه</small><?php endif; ?>
          <button type="submit" class="primary w-full justify-center"><?= $register ? 'ساخت حساب' : 'ورود' ?></button>
        </form>
        <p class="auth-switch"><?= $register ? 'قبلاً حساب ساختی؟' : 'اولین بارته؟' ?>
          <a class="font-bold text-pine underline underline-offset-4" href="<?= $register ? '/' : '/?view=register' ?>"><?= $register ? 'وارد شو' : 'ساخت حساب' ?></a>
        </p>
      </div>
      <div class="auth-art" role="img" aria-label="تصویر یک کافه در برلین"></div>
    </section>
  </div>
</main>
<script>
document.querySelector('#auth-theme').onclick = LernhausTheme.toggle;
window.addEventListener('pageshow', event => { if (event.persisted) location.reload() });
</script>

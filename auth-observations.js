
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const supabase = createClient(
  "https://bydkbesdjrfcrsivmoru.supabase.co",
  "sb_publishable_ohiW4Aeg0fNe0SaQu2FFkQ_anz2PoAO"
);

const BUCKET = "champi-observations";
const MAX_BYTES = 10 * 1024 * 1024;
const SITE_URL = "https://valentinlefrenchy.github.io/champi-de-demain/";

const TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif"
};

const $ = id => document.getElementById(id);

function node(tag, text, cls) {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  if (cls) element.className = cls;
  return element;
}

function message(element, text, error = false) {
  element.textContent = text;
  element.classList.toggle("error", error);
}

function makeInput(id, type, placeholder, autocomplete) {
  const input = node("input");
  input.id = id;
  input.type = type;
  input.placeholder = placeholder;
  input.autocomplete = autocomplete;
  input.style.cssText =
    "display:block;width:100%;box-sizing:border-box;margin:9px 0;padding:13px 15px;border:1px solid #c6cbbb;border-radius:10px;background:#fffefa;color:#26352b;font:16px Arial,sans-serif";
  return input;
}

function makeButton(id, text, primary = false) {
  const button = node("button", text);
  button.id = id;
  button.type = "button";
  button.style.cssText = primary
    ? "display:block;width:100%;padding:13px 16px;margin:9px 0;border:1px solid #183d2c;border-radius:10px;background:#183d2c;color:white;font:bold 16px Arial,sans-serif;cursor:pointer"
    : "display:block;width:100%;padding:12px 16px;margin:9px 0;border:1px solid #183d2c;border-radius:10px;background:#fffefa;color:#183d2c;font:bold 15px Arial,sans-serif;cursor:pointer";
  return button;
}

function setupPanel() {
  const main = document.querySelector("main");
  if (!main || $("champi-account")) return;

  const panel = node("section");
  panel.id = "champi-account";
  panel.style.cssText =
    "padding:22px 6%;background:#f6f3e9;border-bottom:1px solid #e2dfd2";

  const card = node("div");
  card.style.cssText =
    "max-width:850px;margin:0 auto;padding:20px 22px;background:#fffefa;border:1px solid #e4e2d7;border-radius:16px;box-shadow:0 5px 20px rgba(24,61,44,.07)";

  const heading = node("div");
  heading.style.cssText =
    "display:flex;align-items:center;gap:10px;margin-bottom:5px";

  const icon = node("span", "🍄");
  icon.style.fontSize = "25px";

  const title = node("h2", "Mon espace personnel");
  title.style.cssText =
    "margin:0;color:#183d2c;font-size:23px";

  heading.append(icon, title);
  card.append(heading);

  const intro = node(
    "p",
    "Connectez-vous pour retrouver votre carnet et enregistrer vos observations."
  );
  intro.style.cssText =
    "margin:7px 0 16px;color:#667267;font:15px/1.5 Arial,sans-serif";
  card.append(intro);

  const choices = node("div");
  choices.style.cssText =
    "display:grid;grid-template-columns:1fr 1fr;gap:10px";

  const openLogin = makeButton(
    "champi-open-login",
    "Se connecter",
    true
  );

  const openSignup = makeButton(
    "champi-open-signup",
    "Créer un compte"
  );

  choices.append(openLogin, openSignup);
  card.append(choices);

  const form = node("div");
  form.id = "champi-auth-form";
  form.hidden = true;
  form.style.marginTop = "14px";

  const email = makeInput(
    "champi-email",
    "email",
    "Adresse e-mail",
    "email"
  );

  const password = makeInput(
    "champi-password",
    "password",
    "Mot de passe",
    "current-password"
  );

  const passwordConfirm = makeInput(
    "champi-password-confirm",
    "password",
    "Confirmer le mot de passe",
    "new-password"
  );
  passwordConfirm.hidden = true;

  const login = makeButton(
    "champi-login",
    "Se connecter",
    true
  );

  const signup = makeButton(
    "champi-signup",
    "Valider la création du compte",
    true
  );
  signup.hidden = true;

  const forgot = makeButton(
    "champi-forgot",
    "Mot de passe oublié ?"
  );

  const cancel = makeButton(
    "champi-cancel",
    "Fermer"
  );

  form.append(
    email,
    password,
    passwordConfirm,
    login,
    signup,
    forgot,
    cancel
  );

  card.append(form);

  const resetArea = node("div");
  resetArea.id = "champi-reset-area";
  resetArea.hidden = true;

  const newPassword = makeInput(
    "champi-new-password",
    "password",
    "Nouveau mot de passe (8 caractères minimum)",
    "new-password"
  );

  const newPasswordConfirm = makeInput(
    "champi-new-password-confirm",
    "password",
    "Confirmer le nouveau mot de passe",
    "new-password"
  );

  const saveNewPassword = makeButton(
    "champi-save-new-password",
    "Enregistrer le nouveau mot de passe",
    true
  );

  resetArea.append(
    newPassword,
    newPasswordConfirm,
    saveNewPassword
  );

  card.append(resetArea);

  const accountArea = node("div");
  accountArea.id = "champi-account-connected";
  accountArea.hidden = true;

  const logout = makeButton(
    "champi-logout",
    "Se déconnecter"
  );

  const list = node("div");
  list.id = "champi-my-observations";

  accountArea.append(logout, list);
  card.append(accountArea);

  const status = node(
    "p",
    "Vous n'êtes pas connecté."
  );
  status.id = "champi-auth-status";
  status.setAttribute("aria-live", "polite");
  status.style.cssText =
    "margin:12px 0 0;color:#536456;font:14px/1.5 Arial,sans-serif";

  card.append(status);
  panel.append(card);

  // Le compte apparaît juste sous le bandeau du site.
  main.prepend(panel);
}

function describeObservation() {
  const fields = [
    ["Milieu", "obs-habitat"],
    ["Sous le chapeau", "obs-under"],
    ["Forme du chapeau", "obs-cap"],
    ["Pied", "obs-stem"],
    ["Anneau et volve", "obs-ring"],
    ["Autres détails", "obs-color"]
  ];

  return fields
    .map(
      ([label, id]) =>
        `${label} : ${$(id)?.value?.trim() || "Non renseigné"}`
    )
    .join("\n");
}

async function loadMine(user) {
  const list = $("champi-my-observations");
  list.replaceChildren(node("h3", "Mes observations"));

  const { data, error } = await supabase
    .from("observations")
    .select("id,observation_date,description,status,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    list.append(
      node("p", "Impossible de charger votre carnet.")
    );
    console.error(error);
    return;
  }

  if (!data?.length) {
    list.append(node("p", "Votre carnet est vide."));
    return;
  }

  for (const item of data) {
    const card = node("article");
    card.style.cssText =
      "background:#f6f3e9;border:1px solid #e4e2d7;border-radius:10px;padding:12px;margin:10px 0";

    card.append(
      node(
        "strong",
        new Date(
          (item.observation_date || item.created_at) + "T12:00:00"
        ).toLocaleDateString("fr-FR")
      )
    );

    card.append(
      node(
        "p",
        "État : " +
          (item.status === "approved"
            ? "Publiée après modération"
            : item.status === "rejected"
              ? "Non publiée"
              : "En attente de modération")
      )
    );

    if (item.description) {
      card.append(node("p", item.description));
    }

    list.append(card);
  }
}

async function saveObservation(user, status, button) {
  const file = $("obs-photo")?.files?.[0] || null;
  let photoPath = null;

  if (file && !TYPES[file.type]) {
    message(
      status,
      "Format refusé. Utilisez JPEG, PNG, WebP ou HEIC.",
      true
    );
    return;
  }

  if (file && file.size > MAX_BYTES) {
    message(status, "La photo dépasse 10 Mo.", true);
    return;
  }

  button.disabled = true;
  message(status, "Enregistrement sécurisé en cours…");

  try {
    if (file) {
      photoPath =
        `${user.id}/${crypto.randomUUID()}.${TYPES[file.type]}`;

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(photoPath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type
        });

      if (error) throw error;
    }

    const { error } = await supabase
      .from("observations")
      .insert({
        user_id: user.id,
        observation_date: new Date().toISOString().slice(0, 10),
        description: describeObservation(),
        photo_path: photoPath,
        status: "pending"
      });

    if (error) {
      if (photoPath) {
        await supabase.storage
          .from(BUCKET)
          .remove([photoPath]);
      }
      throw error;
    }

    message(
      status,
      "Observation enregistrée. Elle reste privée et attend sa modération."
    );

    await loadMine(user);
  } catch (err) {
    console.error("Enregistrement observation :", err);
    message(
      status,
      "Échec de l'enregistrement. Vérifiez la connexion et réessayez.",
      true
    );
  } finally {
    button.disabled = false;
  }
}

async function start() {
  setupPanel();

  const email = $("champi-email");
  const password = $("champi-password");
  const passwordConfirm = $("champi-password-confirm");
  const status = $("champi-auth-status");

  const form = $("champi-auth-form");
  const resetArea = $("champi-reset-area");
  const accountArea = $("champi-account-connected");

  const openLogin = $("champi-open-login");
  const openSignup = $("champi-open-signup");
  const login = $("champi-login");
  const signup = $("champi-signup");
  const forgot = $("champi-forgot");
  const cancel = $("champi-cancel");
  const logout = $("champi-logout");

  const newPassword = $("champi-new-password");
  const newPasswordConfirm = $("champi-new-password-confirm");
  const saveNewPassword = $("champi-save-new-password");

  const create = $("create-observation");

  if (
    !email ||
    !password ||
    !passwordConfirm ||
    !status ||
    !create
  ) {
    console.error(
      "Intégration Champi : éléments HTML attendus introuvables."
    );
    return;
  }

  const saveStatus = node("p");
  saveStatus.id = "champi-save-status";
  saveStatus.setAttribute("aria-live", "polite");
  create.insertAdjacentElement("afterend", saveStatus);

  let user = null;
  let recoveryMode = false;
  let accountMode = "";

  function showForm(mode) {
    accountMode = mode;
    form.hidden = false;
    resetArea.hidden = true;
    accountArea.hidden = true;

    passwordConfirm.hidden = mode !== "signup";
    login.hidden = mode !== "login";
    signup.hidden = mode !== "signup";
    forgot.hidden = mode !== "login";

    password.value = "";
    passwordConfirm.value = "";

    message(
      status,
      mode === "signup"
        ? "Créez votre compte avec votre adresse e-mail et un mot de passe saisi deux fois."
        : "Saisissez votre adresse e-mail et votre mot de passe."
    );
  }

  function showRecoveryMode(show) {
    recoveryMode = show;
    form.hidden = true;
    resetArea.hidden = !show;
    accountArea.hidden = true;
    openLogin.hidden = show;
    openSignup.hidden = show;

    if (show) {
      message(
        status,
        "Choisissez un nouveau mot de passe pour votre compte."
      );
    }
  }

  async function render(session) {
    user = session?.user || null;

    if (recoveryMode) return;

    if (user) {
      form.hidden = true;
      resetArea.hidden = true;
      accountArea.hidden = false;
      openLogin.hidden = true;
      openSignup.hidden = true;

      message(
        status,
        "Connecté : " + (user.email || "compte actif")
      );

      message(
        saveStatus,
        "Vous pouvez enregistrer votre observation."
      );

      await loadMine(user);
    } else {
      form.hidden = true;
      resetArea.hidden = true;
      accountArea.hidden = true;
      openLogin.hidden = false;
      openSignup.hidden = false;

      message(status, "Vous n'êtes pas connecté.");

      message(
        saveStatus,
        "Connectez-vous pour enregistrer une observation."
      );

      $("champi-my-observations").replaceChildren();
    }
  }

  openLogin.addEventListener("click", () => {
    showForm("login");
  });

  openSignup.addEventListener("click", () => {
    showForm("signup");
  });

  cancel.addEventListener("click", () => {
    form.hidden = true;
    passwordConfirm.hidden = true;
    message(status, "Formulaire fermé.");
  });

  // Connexion : un seul mot de passe.
  login.addEventListener("click", async () => {
    if (!email.value.trim() || !password.value) {
      message(
        status,
        "Saisissez votre adresse e-mail et votre mot de passe.",
        true
      );
      return;
    }

    login.disabled = true;
    message(status, "Connexion en cours…");

    const { data, error } = await supabase.auth
      .signInWithPassword({
        email: email.value.trim(),
        password: password.value
      });

    login.disabled = false;

    if (error) {
      message(
        status,
        "Connexion impossible. Vérifiez vos identifiants.",
        true
      );
      console.error(error);
      return;
    }

    await render(data.session);
  });

  // Création : les deux mots de passe doivent correspondre.
  signup.addEventListener("click", async () => {
    if (!email.value.trim()) {
      message(status, "Saisissez votre adresse e-mail.", true);
      email.focus();
      return;
    }

    if (password.value.length < 8) {
      message(
        status,
        "Mot de passe : 8 caractères minimum.",
        true
      );
      password.focus();
      return;
    }

    if (password.value !== passwordConfirm.value) {
      message(
        status,
        "Les deux mots de passe ne correspondent pas.",
        true
      );
      passwordConfirm.focus();
      return;
    }

    signup.disabled = true;
    message(status, "Création du compte…");

    const { data, error } = await supabase.auth.signUp({
      email: email.value.trim(),
      password: password.value,
      options: {
        emailRedirectTo: SITE_URL
      }
    });

    signup.disabled = false;

    if (error) {
      message(
        status,
        "Création du compte impossible. Vérifiez les informations.",
        true
      );
      console.error(error);
      return;
    }

    if (data.session) {
      await render(data.session);
    } else {
      form.hidden = true;
      message(
        status,
        "Compte créé. Vérifiez votre e-mail pour confirmer l'inscription."
      );
    }
  });

  // Mot de passe oublié.
  forgot.addEventListener("click", async () => {
    if (!email.value.trim()) {
      message(
        status,
        "Saisissez d'abord votre adresse e-mail.",
        true
      );
      email.focus();
      return;
    }

    message(status, "Envoi du lien de réinitialisation…");

    const { error } = await supabase.auth
      .resetPasswordForEmail(email.value.trim(), {
        redirectTo: SITE_URL
      });

    if (error) {
      message(
        status,
        "Impossible d'envoyer le lien. Vérifiez l'adresse e-mail et réessayez.",
        true
      );
      console.error(error);
      return;
    }

    message(
      status,
      "Si cette adresse correspond à un compte, un e-mail de réinitialisation va être envoyé. Vérifiez aussi les courriers indésirables."
    );
  });

  // Enregistrement du nouveau mot de passe.
  saveNewPassword.addEventListener("click", async () => {
    if (newPassword.value.length < 8) {
      message(
        status,
        "Nouveau mot de passe : 8 caractères minimum.",
        true
      );
      newPassword.focus();
      return;
    }

    if (newPassword.value !== newPasswordConfirm.value) {
      message(
        status,
        "Les deux nouveaux mots de passe ne correspondent pas.",
        true
      );
      newPasswordConfirm.focus();
      return;
    }

    saveNewPassword.disabled = true;
    message(status, "Mise à jour du mot de passe…");

    const { error } = await supabase.auth.updateUser({
      password: newPassword.value
    });

    saveNewPassword.disabled = false;

    if (error) {
      message(
        status,
        "La mise à jour a échoué. Demandez un nouveau lien et réessayez.",
        true
      );
      console.error(error);
      return;
    }

    newPassword.value = "";
    newPasswordConfirm.value = "";

    showRecoveryMode(false);

    await render(
      (await supabase.auth.getSession()).data.session
    );

    message(
      status,
      "Votre mot de passe a été modifié."
    );
  });

  // Déconnexion.
  logout.addEventListener("click", async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      message(status, "Déconnexion impossible.", true);
      console.error(error);
      return;
    }

    await render(null);
  });

  // Enregistrement d'une observation.
  create.addEventListener("click", async () => {
    if (!user) {
      message(
        saveStatus,
        "Connectez-vous avant d'enregistrer.",
        true
      );
      return;
    }

    await saveObservation(user, saveStatus, create);
  });

  const {
    data: { session }
  } = await supabase.auth.getSession();

  await render(session);

  supabase.auth.onAuthStateChange((event, sessionNow) => {
    if (event === "PASSWORD_RECOVERY") {
      showRecoveryMode(true);
      return;
    }

    queueMicrotask(() => render(sessionNow));
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, {
    once: true
  });
} else {
  start();
}

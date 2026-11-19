
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

function node(tag, text) {
  const el = document.createElement(tag);
  if (text) el.textContent = text;
  return el;
}

function message(el, text, error = false) {
  el.textContent = text;
  el.style.color = error ? "#a12d25" : "#536456";
}

function makeInput(id, type, placeholder, autocomplete) {
  const input = node("input");
  input.id = id;
  input.type = type;
  input.placeholder = placeholder;
  input.autocomplete = autocomplete;
  input.style.cssText =
    "display:block;width:100%;box-sizing:border-box;margin:10px 0;padding:14px;border:1px solid #c6cbbb;border-radius:10px;background:#fffefa;color:#26352b;font:16px Arial,sans-serif";
  return input;
}

function makeButton(id, text, primary = false) {
  const button = node("button", text);
  button.id = id;
  button.type = "button";
  button.style.cssText = primary
    ? "width:100%;padding:14px;margin:9px 0 0;border:1px solid #183d2c;border-radius:10px;background:#183d2c;color:white;font:bold 16px Arial,sans-serif;cursor:pointer"
    : "width:100%;padding:13px;margin:9px 0 0;border:1px solid #183d2c;border-radius:10px;background:#fffefa;color:#183d2c;font:bold 15px Arial,sans-serif;cursor:pointer";
  return button;
}

function makeCard(title, description) {
  const card = node("section");
  card.style.cssText =
    "min-width:0;padding:20px;background:#fffefa;border:1px solid #dedfd2;border-radius:16px;box-shadow:0 5px 18px rgba(24,61,44,.07)";

  const heading = node("h3", title);
  heading.style.cssText =
    "margin:0 0 8px;color:#183d2c;font-size:22px";

  const intro = node("p", description);
  intro.style.cssText =
    "margin:0 0 16px;color:#667267;font:15px/1.5 Arial,sans-serif";

  card.append(heading, intro);
  return card;
}

function setupPanel() {
  const main = document.querySelector("main");
  if (!main || $("champi-account")) return;

  const panel = node("section");
  panel.id = "champi-account";
  panel.style.cssText =
    "padding:25px 5%;background:#f6f3e9;border-bottom:1px solid #e2dfd2";

  const container = node("div");
  container.style.cssText = "max-width:900px;margin:0 auto";

  const title = node("h2", "Mon espace personnel");
  title.style.cssText =
    "margin:0 0 8px;text-align:center;color:#183d2c;font-size:27px";

  const intro = node(
    "p",
    "Bienvenue dans votre espace Champi de Demain."
  );
  intro.style.cssText =
    "margin:0 auto 22px;text-align:center;color:#667267;font:15px/1.5 Arial,sans-serif";

  const cards = node("div");
  cards.className = "champi-auth-cards";

  const loginCard = makeCard(
    "Se connecter",
    "Vous avez déjà un compte ? Retrouvez votre espace personnel."
  );

  const signupCard = makeCard(
    "Créer un compte",
    "Rejoignez Champi de Demain et conservez vos observations."
  );

  // CONNEXION : les champs sont visibles immédiatement.
  const loginEmail = makeInput(
    "champi-login-email",
    "email",
    "Votre adresse e-mail",
    "username"
  );

  const loginPassword = makeInput(
    "champi-login-password",
    "password",
    "Votre mot de passe",
    "current-password"
  );

  const loginButton = makeButton(
    "champi-login-button",
    "Se connecter",
    true
  );

  const forgotButton = makeButton(
    "champi-forgot-button",
    "Mot de passe oublié ?"
  );

  loginCard.append(
    loginEmail,
    loginPassword,
    loginButton,
    forgotButton
  );

  // INSCRIPTION : seul le bouton est visible au départ.
  const signupStart = makeButton(
    "champi-show-signup",
    "Créer un compte",
    true
  );

  const signupForm = node("div");
  signupForm.id = "champi-signup-form";
  signupForm.hidden = true;
  signupForm.style.marginTop = "12px";

  const signupEmail = makeInput(
    "champi-signup-email",
    "email",
    "Votre adresse e-mail",
    "email"
  );

  const signupPassword = makeInput(
    "champi-signup-password",
    "password",
    "Mot de passe (8 caractères minimum)",
    "new-password"
  );

  const signupConfirm = makeInput(
    "champi-signup-confirm",
    "password",
    "Confirmer le mot de passe",
    "new-password"
  );

  const signupButton = makeButton(
    "champi-signup-button",
    "Valider mon inscription",
    true
  );

  const signupCancel = makeButton(
    "champi-signup-cancel",
    "Annuler"
  );

  signupForm.append(
    signupEmail,
    signupPassword,
    signupConfirm,
    signupButton,
    signupCancel
  );

  signupCard.append(signupStart, signupForm);
  cards.append(loginCard, signupCard);

  const style = node("style");
  style.textContent = `
    #champi-account .champi-auth-cards {
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:18px;
      align-items:start;
    }
    #champi-account input:focus {
      outline:2px solid #d6ae69;
      outline-offset:2px;
    }
    #champi-account button:disabled {
      opacity:.55;
      cursor:wait;
    }
    #champi-account [hidden] {
      display:none !important;
    }
    @media(max-width:650px) {
      #champi-account {
        padding:20px 16px !important;
      }
      #champi-account .champi-auth-cards {
        grid-template-columns:1fr !important;
        gap:14px;
      }
      #champi-account h2 {
        font-size:24px !important;
      }
    }
  `;
  document.head.append(style);

  // Message de statut.
  const status = node("p", "Vous n'êtes pas connecté.");
  status.id = "champi-auth-status";
  status.setAttribute("aria-live", "polite");
  status.style.cssText =
    "margin:16px 0 0;padding:12px;border-radius:9px;background:#eeeee5;color:#536456;font:14px/1.5 Arial,sans-serif";

  // Réinitialisation du mot de passe.
  const resetArea = node("div");
  resetArea.id = "champi-reset-area";
  resetArea.hidden = true;
  resetArea.style.cssText =
    "max-width:550px;margin:18px auto;padding:18px;background:#fffefa;border:1px solid #dedfd2;border-radius:14px";

  const resetTitle = node("h3", "Choisir un nouveau mot de passe");
  resetTitle.style.color = "#183d2c";

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
    resetTitle,
    newPassword,
    newPasswordConfirm,
    saveNewPassword
  );

  // Espace du membre connecté.
  const connectedArea = node("div");
  connectedArea.id = "champi-connected-area";
  connectedArea.hidden = true;
  connectedArea.style.cssText =
    "margin-top:18px;padding:18px;background:#fffefa;border:1px solid #dedfd2;border-radius:14px";

  const connectedTitle = node("h3", "Votre espace");
  connectedTitle.style.color = "#183d2c";

  const logout = makeButton(
    "champi-logout",
    "Se déconnecter"
  );

  const list = node("div");
  list.id = "champi-my-observations";

  connectedArea.append(connectedTitle, logout, list);

  container.append(
    title,
    intro,
    cards,
    resetArea,
    connectedArea,
    status
  );

  panel.append(container);

  // Position en haut, immédiatement après le bandeau du site.
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
    list.append(node("p", "Impossible de charger votre carnet."));
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
        await supabase.storage.from(BUCKET).remove([photoPath]);
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

  const loginEmail = $("champi-login-email");
  const loginPassword = $("champi-login-password");
  const signupEmail = $("champi-signup-email");
  const signupPassword = $("champi-signup-password");
  const signupConfirm = $("champi-signup-confirm");

  const signupForm = $("champi-signup-form");
  const signupStart = $("champi-show-signup");
  const signupCancel = $("champi-signup-cancel");

  const loginButton = $("champi-login-button");
  const signupButton = $("champi-signup-button");
  const forgotButton = $("champi-forgot-button");
  const logout = $("champi-logout");

  const status = $("champi-auth-status");
  const resetArea = $("champi-reset-area");
  const connectedArea = $("champi-connected-area");

  const newPassword = $("champi-new-password");
  const newPasswordConfirm = $("champi-new-password-confirm");
  const saveNewPassword = $("champi-save-new-password");

  const create = $("create-observation");

  if (
    !loginEmail ||
    !loginPassword ||
    !signupEmail ||
    !signupPassword ||
    !signupConfirm ||
    !status ||
    !create
  ) {
    console.error("Intégration Champi : éléments HTML introuvables.");
    return;
  }

  const saveStatus = node("p");
  saveStatus.id = "champi-save-status";
  saveStatus.setAttribute("aria-live", "polite");
  create.insertAdjacentElement("afterend", saveStatus);

  let user = null;
  let recoveryMode = false;

  function showRecoveryMode(show) {
    recoveryMode = show;
    resetArea.hidden = !show;
    $("champi-account").querySelector(".champi-auth-cards").hidden = show;
    connectedArea.hidden = true;

    if (show) {
      message(status, "Choisissez un nouveau mot de passe pour votre compte.");
    }
  }

  async function render(session) {
    user = session?.user || null;

    if (recoveryMode) return;

    connectedArea.hidden = !user;
    $("champi-account").querySelector(".champi-auth-cards").hidden = !!user;
    resetArea.hidden = true;

    if (user) {
      signupForm.hidden = true;
      message(status, "Connecté : " + (user.email || "compte actif"));
      message(saveStatus, "Vous pouvez enregistrer votre observation.");
      await loadMine(user);
    } else {
      message(status, "Vous n'êtes pas connecté.");
      message(saveStatus, "Connectez-vous pour enregistrer une observation.");
      $("champi-my-observations").replaceChildren();
    }
  }

  // Afficher le formulaire d'inscription uniquement sur demande.
  signupStart.addEventListener("click", () => {
    signupForm.hidden = false;
    signupStart.hidden = true;
    signupEmail.focus();
  });

  signupCancel.addEventListener("click", () => {
    signupForm.hidden = true;
    signupStart.hidden = false;
    signupEmail.value = "";
    signupPassword.value = "";
    signupConfirm.value = "";
    message(status, "Création de compte annulée.");
  });

  // Connexion : un seul mot de passe.
  loginButton.addEventListener("click", async () => {
    if (!loginEmail.value.trim() || !loginPassword.value) {
      message(status, "Saisissez votre adresse e-mail et votre mot de passe.", true);
      return;
    }

    loginButton.disabled = true;
    message(status, "Connexion en cours…");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail.value.trim(),
      password: loginPassword.value
    });

    loginButton.disabled = false;

    if (error) {
      message(status, "Connexion impossible. Vérifiez vos identifiants.", true);
      console.error(error);
      return;
    }

    await render(data.session);
  });

  // Création : e-mail, mot de passe et confirmation.
  signupButton.addEventListener("click", async () => {
    if (!signupEmail.value.trim()) {
      message(status, "Saisissez votre adresse e-mail.", true);
      signupEmail.focus();
      return;
    }

    if (signupPassword.value.length < 8) {
      message(status, "Le mot de passe doit contenir au moins 8 caractères.", true);
      signupPassword.focus();
      return;
    }

    if (signupPassword.value !== signupConfirm.value) {
      message(status, "Les deux mots de passe ne correspondent pas.", true);
      signupConfirm.focus();
      return;
    }

    signupButton.disabled = true;
    message(status, "Création du compte en cours…");

    const { data, error } = await supabase.auth.signUp({
      email: signupEmail.value.trim(),
      password: signupPassword.value,
      options: {
        emailRedirectTo: SITE_URL
      }
    });

    signupButton.disabled = false;

    if (error) {
      message(status, "Création du compte impossible. Vérifiez les informations.", true);
      console.error(error);
      return;
    }

    signupPassword.value = "";
    signupConfirm.value = "";
    signupForm.hidden = true;
    signupStart.hidden = false;

    if (data.session) {
      await render(data.session);
    } else {
      message(status, "Compte créé. Vérifiez votre e-mail pour confirmer l'inscription.");
    }
  });

  // Mot de passe oublié.
  forgotButton.addEventListener("click", async () => {
    if (!loginEmail.value.trim()) {
      message(status, "Saisissez votre adresse e-mail dans la carte de connexion.", true);
      loginEmail.focus();
      return;
    }

    message(status, "Envoi du lien de réinitialisation…");

    const { error } = await supabase.auth.resetPasswordForEmail(
      loginEmail.value.trim(),
      { redirectTo: SITE_URL }
    );

    if (error) {
      message(status, "Impossible d'envoyer le lien. Vérifiez l'adresse e-mail.", true);
      console.error(error);
      return;
    }

    message(
      status,
      "Si cette adresse correspond à un compte, un e-mail de réinitialisation va être envoyé. Vérifiez aussi les courriers indésirables."
    );
  });

  // Enregistrer le nouveau mot de passe.
  saveNewPassword.addEventListener("click", async () => {
    if (newPassword.value.length < 8) {
      message(status, "Le nouveau mot de passe doit contenir au moins 8 caractères.", true);
      newPassword.focus();
      return;
    }

    if (newPassword.value !== newPasswordConfirm.value) {
      message(status, "Les deux nouveaux mots de passe ne correspondent pas.", true);
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
      message(status, "La mise à jour a échoué. Demandez un nouveau lien et réessayez.", true);
      console.error(error);
      return;
    }

    newPassword.value = "";
    newPasswordConfirm.value = "";
    showRecoveryMode(false);

    await render((await supabase.auth.getSession()).data.session);
    message(status, "Votre mot de passe a été modifié.");
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
      message(saveStatus, "Connectez-vous avant d'enregistrer.", true);
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
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}

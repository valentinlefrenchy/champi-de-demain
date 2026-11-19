
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const supabase = createClient(
  "https://bydkbesdjrfcrsivmoru.supabase.co",
  "sb_publishable_ohiW4Aeg0fNe0SaQu2FFkQ_anz2PoAO"
);
const BUCKET = "champi-observations";
const MAX_BYTES = 10 * 1024 * 1024;
const SITE_URL = "https://valentinlefrenchy.github.io/champi-de-demain/";
const TYPES = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
  "image/heic": "heic", "image/heif": "heif"
};
const $ = id => document.getElementById(id);

function node(tag, text, cls) {
  const n = document.createElement(tag);
  if (text) n.textContent = text;
  if (cls) n.className = cls;
  return n;
}
function message(el, text, error = false) {
  el.textContent = text;
  el.classList.toggle("error", error);
}
function makeInput(id, type, placeholder, autocomplete) {
  const input = node("input");
  input.id = id;
  input.type = type;
  input.placeholder = placeholder;
  input.autocomplete = autocomplete;
  input.style.cssText = "display:block;width:100%;box-sizing:border-box;margin:10px 0;padding:14px;border:1px solid #aeb7a9;border-radius:10px;font:inherit";
  return input;
}
function makeButton(id, text, cls = "btn secondary") {
  const button = node("button", text, cls);
  button.id = id;
  button.type = "button";
  return button;
}
function setupPanel() {
  const area = $("observation")?.querySelector(".search-area");
  if (!area || $("champi-account")) return;

  const panel = node("section");
  panel.id = "champi-account";
  panel.style.cssText = "background:#fffefa;border:1px solid #e7e4d9;border-radius:12px;padding:20px;margin-bottom:24px";
  panel.appendChild(node("h3", "Mon compte Champi de Demain"));
  panel.appendChild(node("p", "Connectez-vous pour enregistrer vos observations et retrouver votre carnet sur vos appareils."));

  const email = makeInput("champi-email", "email", "Adresse e-mail", "email");
  const password = makeInput("champi-password", "password", "Mot de passe (8 caractères minimum)", "current-password");
  const passwordConfirm passwordConfirm.hidden = true;= makeInput("champi-password-confirm", "password", "Confirmer le mot de passe", "new-password");
  const login = makeButton("champi-login", "Se connecter", "btn");
  const signup = makeButton("champi-signup", "Créer mon compte", "btn secondary");
  const forgot = makeButton("champi-forgot", "Mot de passe oublié ?", "btn secondary");
  const logout = makeButton("champi-logout", "Se déconnecter", "btn secondary");
  logout.hidden = true;

  const resetPassword = makeInput("champi-new-password", "password", "Nouveau mot de passe (8 caractères minimum)", "new-password");
  const resetConfirm = makeInput("champi-new-password-confirm", "password", "Confirmer le nouveau mot de passe", "new-password");
  const saveNewPassword = makeButton("champi-save-new-password", "Enregistrer le nouveau mot de passe", "btn");
  resetPassword.hidden = true;
  resetConfirm.hidden = true;
  saveNewPassword.hidden = true;

  panel.append(email, password, passwordConfirm, login, signup, forgot, logout);
  panel.append(resetPassword, resetConfirm, saveNewPassword);

  const status = node("p", "Vous n'êtes pas connecté.");
  status.id = "champi-auth-status";
  status.setAttribute("aria-live", "polite");
  panel.append(status);

  const list = node("div");
  list.id = "champi-my-observations";
  panel.append(list);
  area.prepend(panel);
}

function describeObservation() {
  const fields = [
    ["Milieu", "obs-habitat"], ["Sous le chapeau", "obs-under"],
    ["Forme du chapeau", "obs-cap"], ["Pied", "obs-stem"],
    ["Anneau et volve", "obs-ring"], ["Autres détails", "obs-color"]
  ];
  return fields.map(([label, id]) => `${label} : ${$(id)?.value?.trim() || "Non renseigné"}`).join("\n");
}

async function loadMine(user) {
  const list = $("champi-my-observations");
  list.replaceChildren(node("h4", "Mes observations"));
  const { data, error } = await supabase.from("observations")
    .select("id,observation_date,description,status,created_at")
    .eq("user_id", user.id).order("created_at", { ascending: false }).limit(30);
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
    card.style.cssText = "background:white;border:1px solid #e7e4d9;border-radius:8px;padding:12px;margin:10px 0";
    card.append(node("strong", new Date((item.observation_date || item.created_at) + "T12:00:00").toLocaleDateString("fr-FR")));
    card.append(node("p", "État : " + (item.status === "approved" ? "Publiée après modération" : item.status === "rejected" ? "Non publiée" : "En attente de modération")));
    if (item.description) card.append(node("p", item.description));
    list.append(card);
  }
}

async function saveObservation(user, status, button) {
  const file = $("obs-photo")?.files?.[0] || null;
  let photoPath = null;
  if (file && !TYPES[file.type]) {
    message(status, "Format refusé. Utilisez JPEG, PNG, WebP ou HEIC.", true);
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
      photoPath = `${user.id}/${crypto.randomUUID()}.${TYPES[file.type]}`;
      const { error } = await supabase.storage.from(BUCKET).upload(photoPath, file, {
        cacheControl: "3600", upsert: false, contentType: file.type
      });
      if (error) throw error;
    }
    const { error } = await supabase.from("observations").insert({
      user_id: user.id,
      observation_date: new Date().toISOString().slice(0, 10),
      description: describeObservation(),
      photo_path: photoPath,
      status: "pending"
    });
    if (error) {
      if (photoPath) await supabase.storage.from(BUCKET).remove([photoPath]);
      throw error;
    }
    message(status, "Observation enregistrée. Elle reste privée et attend sa modération.");
    await loadMine(user);
  } catch (err) {
    console.error("Enregistrement observation :", err);
    message(status, "Échec de l'enregistrement. Vérifiez la connexion et réessayez.", true);
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
  const login = $("champi-login");
  const signup = $("champi-signup");
  const forgot = $("champi-forgot");
  const logout = $("champi-logout");
  const newPassword = $("champi-new-password");
  const newPasswordConfirm = $("champi-new-password-confirm");
  const saveNewPassword = $("champi-save-new-password");
  const create = $("create-observation");

  if (!email || !password || !passwordConfirm || !status || !create) {
    console.error("Intégration Champi : éléments HTML attendus introuvables.");
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
    email.hidden = show;
    password.hidden = show;
    passwordConfirm.hidden = show;
    login.hidden = show;
    signup.hidden = show;
    forgot.hidden = show;
    logout.hidden = true;
    newPassword.hidden = !show;
    newPasswordConfirm.hidden = !show;
    saveNewPassword.hidden = !show;
    if (show) message(status, "Choisissez un nouveau mot de passe pour votre compte.");
  }

  async function render(session) {
    user = session?.user || null;
    if (recoveryMode) return;
    login.hidden = !!user;
    signup.hidden = !!user;
    forgot.hidden = !!user;
    logout.hidden = !user;
    email.hidden = !!user;
    password.hidden = !!user;
    passwordConfirm.hidden = !!user;
    if (user) {
      message(status, "Connecté : " + (user.email || "compte actif"));
      message(saveStatus, "Vous pouvez enregistrer votre observation.");
      await loadMine(user);
    } else {
      message(status, "Vous n'êtes pas connecté.");
      message(saveStatus, "Connectez-vous pour enregistrer une observation.");
      $("champi-my-observations").replaceChildren();
    }
  }

  login.addEventListener("click", async () => {
    message(status, "Connexion en cours…");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value
    });
    if (error) {
      message(status, "Connexion impossible. Vérifiez vos identifiants.", true);
      console.error(error);
      return;
    }
    await render(data.session);
  });

  signup.addEventListener("click", async () => {
    if (!email.value.trim()) {
      message(status, "Saisissez votre adresse e-mail.", true);
      return;
    }
    if (password.value.length < 8) {
      message(status, "Mot de passe : 8 caractères minimum.", true);
      return;
    }
    if (password.value !== passwordConfirm.value) {
      message(status, "Les deux mots de passe ne correspondent pas.", true);
      passwordConfirm.focus();
      return;
    }
    message(status, "Création du compte…");
    const { data, error } = await supabase.auth.signUp({
      email: email.value.trim(),
      password: password.value,
      options: { emailRedirectTo: SITE_URL }
    });
    if (error) {
      message(status, "Création du compte impossible. Vérifiez les informations.", true);
      console.error(error);
      return;
    }
    if (data.session) await render(data.session);
    else message(status, "Compte créé. Vérifiez votre e-mail pour confirmer l'inscription.");
  });

  forgot.addEventListener("click", async () => {
    if (!email.value.trim()) {
      message(status, "Saisissez d'abord votre adresse e-mail pour recevoir le lien de réinitialisation.", true);
      email.focus();
      return;
    }
    message(status, "Envoi du lien de réinitialisation…");
    const { error } = await supabase.auth.resetPasswordForEmail(email.value.trim(), {
      redirectTo: SITE_URL
    });
    if (error) {
      message(status, "Impossible d'envoyer le lien. Vérifiez l'adresse e-mail et réessayez.", true);
      console.error(error);
      return;
    }
    message(status, "Si cette adresse correspond à un compte, un e-mail de réinitialisation va être envoyé. Pensez à vérifier les courriers indésirables.");
  });

  saveNewPassword.addEventListener("click", async () => {
    if (newPassword.value.length < 8) {
      message(status, "Nouveau mot de passe : 8 caractères minimum.", true);
      return;
    }
    if (newPassword.value !== newPasswordConfirm.value) {
      message(status, "Les deux nouveaux mots de passe ne correspondent pas.", true);
      newPasswordConfirm.focus();
      return;
    }
    saveNewPassword.disabled = true;
    message(status, "Mise à jour du mot de passe…");
    const { error } = await supabase.auth.updateUser({ password: newPassword.value });
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
    message(status, "Votre mot de passe a été modifié. Vous pouvez maintenant vous connecter avec ce nouveau mot de passe.");
  });

  logout.addEventListener("click", async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      message(status, "Déconnexion impossible.", true);
      console.error(error);
      return;
    }
    await render(null);
  });

  create.addEventListener("click", async () => {
    if (!user) {
      message(saveStatus, "Connectez-vous avant d'enregistrer.", true);
      return;
    }
    await saveObservation(user, saveStatus, create);
  });

  const { data: { session } } = await supabase.auth.getSession();
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

// Champi de Demain — Authentification & observations
// Module prêt à intégrer.
// Supabase JS v2 doit être chargé et window.supabaseClient configuré.

(() => {
  const supabase = window.supabaseClient;

  if (!supabase) {
    console.error("Champi de Demain : client Supabase introuvable.");
    return;
  }

  const $ = (id) => document.getElementById(id);

  const setText = (id, text) => {
    const element = $(id);
    if (element) element.textContent = text;
  };

  // =========================
  // AUTHENTIFICATION
  // =========================

  async function refreshAuth() {
    const { data: { user } } = await supabase.auth.getUser();

    const auth = $("auth");
    const account = $("account");

    if (auth) auth.hidden = !!user;
    if (account) account.hidden = !user;

    setText("account-label", user?.email || "Mon compte");

    if (user) {
      await loadMyObservations();
    }

    return user;
  }

  async function signUp() {
    const email = $("email")?.value.trim();
    const password = $("password")?.value;

    if (!email || !password) {
      setText("auth-status", "Renseigne ton e-mail et ton mot de passe.");
      return;
    }

    setText("auth-status", "Création du compte…");

    const { error } = await supabase.auth.signUp({
      email,
      password
    });

    setText(
      "auth-status",
      error
        ? error.message
        : "Compte créé. Vérifie ton e-mail si une confirmation est demandée."
    );

    if (!error) await refreshAuth();
  }

  async function signIn() {
    const email = $("email")?.value.trim();
    const password = $("password")?.value;

    if (!email || !password) {
      setText("auth-status", "Renseigne ton e-mail et ton mot de passe.");
      return;
    }

    setText("auth-status", "Connexion…");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setText(
      "auth-status",
      error ? error.message : "Connexion réussie."
    );

    if (!error) await refreshAuth();
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    setText(
      "auth-status",
      error ? error.message : "Déconnexion réussie."
    );

    await refreshAuth();
  }

  // =========================
  // PHOTOS
  // =========================

  async function uploadPhoto(file, userId) {
    if (!file) return null;

    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      throw new Error("Photo acceptée : JPG, PNG ou WebP.");
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error("La photo doit faire moins de 10 Mo.");
    }

    const extension =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
        ? "webp"
        : "jpg";

    const path = `${userId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from("observation-photos")
      .upload(path, file, {
        contentType: file.type,
        upsert: false
      });

    if (error) throw error;

    return path;
  }

  // =========================
  // ENREGISTREMENT OBSERVATION
  // =========================

  async function submitObservation() {
    const { data: { user }, error: userError } =
      await supabase.auth.getUser();

    if (userError || !user) {
      setText(
        "obs-status",
        "Connecte-toi pour publier une observation."
      );
      return;
    }

    const mushroomId = $("species")?.value;

    const date =
      $("date")?.value ||
      new Date().toISOString().slice(0, 10);

    const description =
      $("description")?.value.trim() || null;

    const visibility =
      $("visibility")?.value || "public";

    const latitude =
      $("lat")?.value
        ? Number($("lat").value)
        : null;

    const longitude =
      $("lng")?.value
        ? Number($("lng").value)
        : null;

    const place =
      $("place")?.value.trim() || null;

    const file =
      $("photo")?.files?.[0] || null;

    if (!mushroomId) {
      setText(
        "obs-status",
        "Choisis une espèce ou indique « non identifiée »."
      );
      return;
    }

    if ((latitude === null) !== (longitude === null)) {
      setText(
        "obs-status",
        "Les coordonnées GPS sont incomplètes."
      );
      return;
    }

    setText("obs-status", "Envoi de l’observation…");

    try {
      const photoPath = await uploadPhoto(file, user.id);

      const observation = {
        user_id: user.id,
        mushroom_id: mushroomId,
        observed_at: date,
        description,
        visibility,
        latitude,
        longitude,
        location_label: place,
        photo_path: photoPath
      };

      const { error } = await supabase
        .from("observations")
        .insert(observation);

      if (error) throw error;

      setText(
        "obs-status",
        "Observation enregistrée. Elle pourra être modérée avant publication."
      );

      if ($("description")) $("description").value = "";
      if ($("photo")) $("photo").value = "";
      if ($("preview")) $("preview").innerHTML = "";

      await loadMyObservations();

    } catch (error) {
      setText(
        "obs-status",
        error.message || "Erreur lors de l’enregistrement."
      );
    }
  }

  // =========================
  // MES OBSERVATIONS
  // =========================

  async function loadMyObservations() {
    const { data: { user } } =
      await supabase.auth.getUser();

    if (!user) return;

    const container = $("mine");

    if (!container) return;

    setText("mine-status", "Chargement…");

    const { data, error } = await supabase
      .from("observations")
      .select(`
        id,
        observed_at,
        description,
        visibility,
        status,
        location_label,
        mushroom_id
      `)
      .eq("user_id", user.id)
      .order("observed_at", {
        ascending: false
      });

    if (error) {
      setText("mine-status", error.message);
      return;
    }

    container.innerHTML = "";

    if (!data || data.length === 0) {
      setText(
        "mine-status",
        "Tu n’as pas encore publié d’observation."
      );
      return;
    }

    setText("mine-status", "");

    data.forEach((observation) => {
      const card = document.createElement("article");

      card.className = "observation-card";

      const title = document.createElement("strong");
      title.textContent =
        observation.mushroom_id || "Observation";

      const details = document.createElement("p");

      details.textContent =
        `${observation.observed_at || ""}` +
        (
          observation.location_label
            ? " · " + observation.location_label
            : ""
        );

      const description = document.createElement("p");

      description.textContent =
        observation.description || "";

      const status = document.createElement("small");

      status.textContent =
        `Statut : ${observation.status || "en attente"} · ` +
        `${observation.visibility || "privée"}`;

      card.append(
        title,
        details,
        description,
        status
      );

      container.append(card);
    });
  }

  // =========================
  // BOUTONS
  // =========================

  $("signup")?.addEventListener(
    "click",
    signUp
  );

  $("login")?.addEventListener(
    "click",
    signIn
  );

  $("logout")?.addEventListener(
    "click",
    signOut
  );

  $("submit")?.addEventListener(
    "click",
    submitObservation
  );

  // =========================
  // INITIALISATION
  // =========================

  supabase.auth.onAuthStateChange(() => {
    refreshAuth();
  });

  refreshAuth();

  // Fonctions utilisables par les autres modules

  window.champiAuth = {
    refreshAuth,
    signUp,
    signIn,
    signOut
  };

  window.champiObservations = {
    submitObservation,
    loadMyObservations
  };

})();
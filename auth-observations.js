// ==========================================
// CHAMPI DE DEMAIN
// Authentification + Observations
// Compatible avec la base Supabase actuelle
// ==========================================

const supabase = window.supabaseClient;

if (!supabase) {
  console.error("Supabase client non disponible.");
}

// ------------------------------------------
// ELEMENTS HTML
// ------------------------------------------

const authStatus = document.getElementById("auth-status");
const accountLabel = document.getElementById("account-label");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const signupButton = document.getElementById("signup");
const loginButton = document.getElementById("login");
const logoutButton = document.getElementById("logout");

const observationForm = document.getElementById("observation-form");

const speciesInput = document.getElementById("species");
const dateInput = document.getElementById("date");
const descriptionInput = document.getElementById("description");
const visibilityInput = document.getElementById("visibility");
const placeInput = document.getElementById("place");

const latitudeInput = document.getElementById("lat");
const longitudeInput = document.getElementById("lng");

const photoInput = document.getElementById("photo");
const photoPreview = document.getElementById("preview");

const observationStatus = document.getElementById("obs-status");

const observationsContainer = document.getElementById("mine");
const observationsStatus = document.getElementById("mine-status");

// ------------------------------------------
// UTILITAIRES
// ------------------------------------------

function showMessage(element, message, type = "") {
  if (!element) return;

  element.textContent = message;
  element.dataset.type = type;
}

function getCurrentUser() {
  return supabase.auth.getUser();
}

function formatDate(date) {
  if (!date) return "Date inconnue";

  return new Date(date).toLocaleDateString("fr-FR");
}

// ------------------------------------------
// AUTHENTIFICATION
// ------------------------------------------

async function signup() {
  const email = emailInput?.value.trim();
  const password = passwordInput?.value;

  if (!email || !password) {
    showMessage(authStatus, "Veuillez remplir tous les champs.");
    return;
  }

  if (password.length < 6) {
    showMessage(
      authStatus,
      "Le mot de passe doit contenir au moins 6 caractères."
    );
    return;
  }

  showMessage(authStatus, "Création du compte...");

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    showMessage(authStatus, error.message, "error");
    return;
  }

  if (data.user && !data.session) {
    showMessage(
      authStatus,
      "Compte créé ! Vérifiez votre boîte mail pour confirmer votre inscription.",
      "success"
    );

    return;
  }

  showMessage(authStatus, "Compte créé avec succès !", "success");

  await updateAuthUI();
}

// ------------------------------------------

async function login() {
  const email = emailInput?.value.trim();
  const password = passwordInput?.value;

  if (!email || !password) {
    showMessage(authStatus, "Veuillez remplir tous les champs.");
    return;
  }

  showMessage(authStatus, "Connexion en cours...");

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    showMessage(authStatus, error.message, "error");
    return;
  }

  showMessage(authStatus, "Connexion réussie !", "success");

  await updateAuthUI();
}

// ------------------------------------------

async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    showMessage(authStatus, error.message, "error");
    return;
  }

  showMessage(authStatus, "Vous êtes déconnecté.");

  await updateAuthUI();
}

// ------------------------------------------
// ETAT DU COMPTE
// ------------------------------------------

async function updateAuthUI() {
  const { data, error } = await getCurrentUser();

  if (error) {
    console.error(error);
    return;
  }

  const user = data.user;

  const authSection = document.getElementById("auth");
  const accountSection = document.getElementById("account");

  if (user) {
    if (authSection) authSection.hidden = true;
    if (accountSection) accountSection.hidden = false;

    if (accountLabel) {
      accountLabel.textContent = user.email;
    }

    await loadMyObservations();

  } else {
    if (authSection) authSection.hidden = false;
    if (accountSection) accountSection.hidden = true;

    if (accountLabel) {
      accountLabel.textContent = "";
    }

    if (observationsContainer) {
      observationsContainer.innerHTML = "";
    }

    showMessage(
      observationsStatus,
      "Connectez-vous pour retrouver vos observations."
    );
  }
}

// ------------------------------------------
// PHOTO
// ------------------------------------------

photoInput?.addEventListener("change", () => {
  const file = photoInput.files?.[0];

  if (!file) {
    if (photoPreview) {
      photoPreview.innerHTML = "";
    }

    return;
  }

  if (!file.type.startsWith("image/")) {
    showMessage(observationStatus, "Veuillez sélectionner une image.");
    photoInput.value = "";
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    showMessage(
      observationStatus,
      "La photo doit faire moins de 10 Mo."
    );

    photoInput.value = "";
    return;
  }

  if (photoPreview) {
    photoPreview.innerHTML = "";

    const image = document.createElement("img");

    image.src = URL.createObjectURL(file);
    image.alt = "Photo de l'observation";

    image.style.maxWidth = "100%";
    image.style.borderRadius = "12px";

    photoPreview.appendChild(image);
  }
});

// ------------------------------------------
// UPLOAD PHOTO SUPABASE
// ------------------------------------------

async function uploadPhoto(file, userId) {
  if (!file) return null;

  const extension = file.name.split(".").pop();

  const filename =
    `${userId}/${Date.now()}.${extension}`;

  const { data, error } = await supabase.storage
    .from("observation-photos")
    .upload(filename, file, {
      cacheControl: "3600",
      upsert: false
    });

  if (error) {
    throw error;
  }

  return data.path;
}

// ------------------------------------------
// CREATION OBSERVATION
// ------------------------------------------

async function submitObservation(event) {
  event?.preventDefault();

  const { data, error: userError } = await getCurrentUser();

  if (userError || !data.user) {
    showMessage(
      observationStatus,
      "Vous devez être connecté pour publier une observation."
    );

    return;
  }

  const user = data.user;

  const observationDate =
    dateInput?.value || new Date().toISOString().split("T")[0];

  const description =
    descriptionInput?.value.trim() || null;

  const visibility =
    visibilityInput?.value || "private";

  const approximateLocation =
    placeInput?.value.trim() || null;

  const latitude =
    latitudeInput?.value
      ? Number(latitudeInput.value)
      : null;

  const longitude =
    longitudeInput?.value
      ? Number(longitudeInput.value)
      : null;

  const mushroomId =
    speciesInput?.value || null;

  const photo = photoInput?.files?.[0] || null;

  showMessage(
    observationStatus,
    "Enregistrement de l'observation..."
  );

  try {
    let photoPath = null;

    if (photo) {
      photoPath = await uploadPhoto(photo, user.id);
    }

    // Colonnes réellement présentes
    // dans public.observations

    const observation = {
      user_id: user.id,
      mushroom_id: mushroomId,
      observation_date: observationDate,
      description: description,
      visibility: visibility,
      approximate_location: approximateLocation,
      latitude: latitude,
      longitude: longitude,
      photo_path: photoPath
    };

    const { error } = await supabase
      .from("observations")
      .insert(observation);

    if (error) {
      throw error;
    }

    showMessage(
      observationStatus,
      "Observation enregistrée avec succès !",
      "success"
    );

    if (observationForm) {
      observationForm.reset();
    }

    if (photoPreview) {
      photoPreview.innerHTML = "";
    }

    await loadMyObservations();

  } catch (error) {
    console.error(error);

    showMessage(
      observationStatus,
      "Erreur lors de l'enregistrement : " + error.message,
      "error"
    );
  }
}

// ------------------------------------------
// CHARGEMENT OBSERVATIONS PERSONNELLES
// ------------------------------------------

async function loadMyObservations() {
  const { data: userData, error: userError } =
    await getCurrentUser();

  if (userError || !userData.user) {
    return;
  }

  const user = userData.user;

  showMessage(
    observationsStatus,
    "Chargement de vos observations..."
  );

  const { data, error } = await supabase
    .from("observations")
    .select(`
      id,
      observation_date,
      description,
      visibility,
      status,
      approximate_location,
      mushroom_id,
      photo_path
    `)
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false
    });

  if (error) {
    console.error(error);

    showMessage(
      observationsStatus,
      "Impossible de charger les observations."
    );

    return;
  }

  renderMyObservations(data || []);
}

// ------------------------------------------
// AFFICHAGE
// ------------------------------------------

function renderMyObservations(observations) {
  if (!observationsContainer) return;

  observationsContainer.innerHTML = "";

  if (observations.length === 0) {
    showMessage(
      observationsStatus,
      "Vous n'avez pas encore d'observation."
    );

    return;
  }

  showMessage(
    observationsStatus,
    `${observations.length} observation(s)`
  );

  observations.forEach(observation => {
    const card = document.createElement("article");

    card.className = "observation-card";

    const title = document.createElement("h3");

    title.textContent =
      observation.mushroom_id
        ? "Observation de champignon"
        : "Observation";

    const date = document.createElement("p");

    date.textContent =
      "Date : " + formatDate(observation.observation_date);

    const location = document.createElement("p");

    location.textContent =
      observation.approximate_location
        ? "Lieu : " + observation.approximate_location
        : "Lieu non renseigné";

    const description = document.createElement("p");

    description.textContent =
      observation.description || "Aucune description.";

    const status = document.createElement("p");

    status.textContent =
      "Statut : " + observation.status;

    const visibility = document.createElement("p");

    visibility.textContent =
      observation.visibility === "public"
        ? "🌍 Observation publique"
        : "🔒 Observation privée";

    card.appendChild(title);
    card.appendChild(date);
    card.appendChild(location);
    card.appendChild(description);
    card.appendChild(status);
    card.appendChild(visibility);

    observationsContainer.appendChild(card);
  });
}

// ------------------------------------------
// GPS
// ------------------------------------------

function getGPS() {
  if (!navigator.geolocation) {
    showMessage(
      observationStatus,
      "La géolocalisation n'est pas disponible."
    );

    return;
  }

  showMessage(
    observationStatus,
    "Recherche de votre position..."
  );

  navigator.geolocation.getCurrentPosition(
    position => {
      if (latitudeInput) {
        latitudeInput.value =
          position.coords.latitude;
      }

      if (longitudeInput) {
        longitudeInput.value =
          position.coords.longitude;
      }

      showMessage(
        observationStatus,
        "Position GPS enregistrée."
      );
    },

    error => {
      showMessage(
        observationStatus,
        "Impossible d'obtenir votre position GPS."
      );

      console.error(error);
    },

    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
}

// ------------------------------------------
// EVENEMENTS
// ------------------------------------------

signupButton?.addEventListener(
  "click",
  signup
);

loginButton?.addEventListener(
  "click",
  login
);

logoutButton?.addEventListener(
  "click",
  logout
);

observationForm?.addEventListener(
  "submit",
  submitObservation
);

document
  .getElementById("obs-geolocate")
  ?.addEventListener("click", getGPS);

// ------------------------------------------
// INITIALISATION
// ------------------------------------------

supabase?.auth.onAuthStateChange(
  async (event, session) => {
    console.log("Auth event :", event);

    await updateAuthUI();
  }
);

updateAuthUI();
// Mock Database (works without backend)
class MockDatabase {
  static get STORAGE_KEY() {
    return "keyVaultLinks";
  }

  static getLinks() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      return [];
    }
  }

  static addLink(linkData) {
    const links = this.getLinks();
    const newLink = {
      _id: "link-" + Date.now(),
      ...linkData,
      createdAt: new Date().toISOString(),
    };

    links.unshift(newLink);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(links));
    return newLink;
  }

  static deleteLink(linkId) {
    const links = this.getLinks().filter((link) => link._id !== linkId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(links));
  }

  static getUserToken() {
    let token = localStorage.getItem("keyVaultUserToken");
    if (!token) {
      token = "user-" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("keyVaultUserToken", token);
    }
    return token;
  }
}
// Simple API Service (no HTTP calls)
class ApiService {
  static async getLinks() {
    await this.delay(300);
    return {
      success: true,
      data: MockDatabase.getLinks(),
      count: MockDatabase.getLinks().length,
    };
  }

  static async submitLink(linkData) {
    await this.delay(500);
    const newLink = MockDatabase.addLink(linkData);
    return {
      success: true,
      data: newLink,
      message: "Link saved successfully!",
    };
  }

  static async deleteLink(linkId) {
    await this.delay(300);
    MockDatabase.deleteLink(linkId);
    return { success: true, message: "Link deleted successfully!" };
  }

  static delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

function getUserToken() {
  return MockDatabase.getUserToken();
}

// Global delete function
window.deleteLink = async function (linkId) {
  if (!confirm("Are you sure you want to delete this link?")) return;

  try {
    await ApiService.deleteLink(linkId);
    await loadUserLinks();
    showMessage("Link deleted successfully!", "success");
  } catch (error) {
    showMessage("Failed to delete link", "error");
  }
};

// Modal Functionality
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Key Vault Started");

  // Initialize modal
  const addBtn = document.getElementById("add-card-btn");
  const modal = document.getElementById("add-link-modal");
  const cancelBtn = document.getElementById("cancel-btn");
  const form = document.getElementById("link-form");

  if (addBtn && modal) {
    addBtn.addEventListener("click", () => {
      console.log("✅ Opening modal");
      modal.style.display = "flex";
    });
  }

  if (cancelBtn && modal) {
    cancelBtn.addEventListener("click", () => {
      modal.style.display = "none";
      form.reset();
    });
  }

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // Form submission - UPDATED (no email validation)
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("📝 Form submitted");

      const title = document.getElementById("link-title").value.trim();
      const url = document.getElementById("link-url").value.trim();
      const description = document
        .getElementById("link-description")
        .value.trim();

      // Validation (no email check)
      if (!title || !url || !description) {
        return showMessage("Please fill in all fields", "error");
      }

      // URL validation only
      try {
        new URL(url);
      } catch {
        return showMessage("Please enter a valid URL", "error");
      }

      // Show loading
      const spinner = document.getElementById("loading-spinner");
      if (spinner) spinner.style.display = "block";

      try {
        const result = await ApiService.submitLink({
          title,
          url,
          description,
          userToken: getUserToken(),
        });

        showMessage(result.message, "success");
        form.reset();
        await loadUserLinks();

        // Close modal after 2 seconds
        setTimeout(() => {
          modal.style.display = "none";
        }, 2000);
      } catch (error) {
        showMessage("Failed to save link", "error");
      } finally {
        if (spinner) spinner.style.display = "none";
      }
    });
  }

  // Start word animation
  startWordAnimation();

  // Load initial links
  loadUserLinks();
});

// Load user links
async function loadUserLinks() {
  try {
    const result = await ApiService.getLinks();
    const container = document.getElementById("cards-container");

    if (!container) return;

    // Remove existing user cards
    container
      .querySelectorAll(".card.user-submitted")
      .forEach((card) => card.remove());

    // Add user cards
    result.data.forEach((link, index) => {
      const card = document.createElement("div");
      card.className = `card user-submitted card-${(index % 6) + 1}`;
      const isOwner = link.userToken === getUserToken();

      card.innerHTML = `
        <div class="card-header">
          <div class="card-title-container">
            <h2>${escapeHtml(link.title)}</h2>
            ${
              isOwner
                ? `
              <button class="delete-btn-header" onclick="deleteLink('${link._id}')" title="Delete this link">
                🗑️
              </button>
            `
                : ""
            }
          </div>
          <div class="subtitle">${escapeHtml(link.description)}</div>
        </div>
        <div class="card-body">
          <a href="${escapeHtml(
            link.url
          )}" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(link.url)}
          </a>
        </div>
      `;

      const addBtn = document.getElementById("add-card-btn");
      if (addBtn) {
        container.insertBefore(card, addBtn);
      }
    });
  } catch (error) {
    console.error("Error loading links:", error);
  }
}

// Word animation
function startWordAnimation() {
  const words = ["LINKS", "FILES", "NOTES", "EXAMS", "INFO", "VAULT"];
  let currentIndex = 0;

  function changeWord() {
    const animatedWord = document.getElementById("animated-word");
    if (!animatedWord) return;

    const currentWord = words[currentIndex];
    animatedWord.classList.add("sliding-out");

    setTimeout(() => {
      animatedWord.textContent = currentWord;
      animatedWord.classList.remove("sliding-out");
      animatedWord.classList.add("sliding-in");

      setTimeout(() => {
        animatedWord.classList.remove("sliding-in");
      }, 400);
    }, 400);

    currentIndex = (currentIndex + 1) % words.length;
  }

  setInterval(changeWord, 2000);
}

// Utility functions
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showMessage(message, type) {
  const element = document.getElementById(
    type === "success" ? "success-message" : "error-message"
  );
  if (element) {
    element.textContent = message;
    element.style.display = "block";
    setTimeout(() => {
      element.style.display = "none";
    }, 3000);
  }
}

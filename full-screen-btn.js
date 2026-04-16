// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function() {
  const toggleBtn = document.getElementById("fullscreenToggle");
  const revealElement = document.querySelector(".reveal");
  
  if (!toggleBtn) {
    console.error("Fullscreen button not found");
    return;
  }

  if (!revealElement) {
    console.error("Reveal element not found");
    return;
  }

  if (document.fullscreenEnabled || document.webkitFullscreenEnabled) {
    toggleBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      
      console.log("Fullscreen button clicked");
      
      // Check if currently in fullscreen
      const isFullscreen =
        document.fullscreenElement || 
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;

      if (isFullscreen) {
        console.log("Exiting fullscreen");
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      } else {
        console.log("Entering fullscreen");
        // Enter fullscreen on the reveal element
        if (revealElement.requestFullscreen) {
          revealElement.requestFullscreen().catch(err => {
            console.error("Error entering fullscreen:", err);
          });
        } else if (revealElement.webkitRequestFullscreen) {
          revealElement.webkitRequestFullscreen();
        } else if (revealElement.mozRequestFullScreen) {
          revealElement.mozRequestFullScreen();
        } else if (revealElement.msRequestFullscreen) {
          revealElement.msRequestFullscreen();
        }
      }
    });

    // Listen for fullscreen changes (including ESC key)
    document.addEventListener("fullscreenchange", handleFullscreen);
    document.addEventListener("webkitfullscreenchange", handleFullscreen);
    document.addEventListener("mozfullscreenchange", handleFullscreen);
    document.addEventListener("MSFullscreenChange", handleFullscreen);

    function handleFullscreen() {
      const isFullscreen =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;

      console.log("Fullscreen state changed:", isFullscreen ? "FULLSCREEN" : "NORMAL");

      if (isFullscreen) {
        toggleBtn.classList.add("on");
        toggleBtn.setAttribute("aria-label", "Exit fullscreen mode");
      } else {
        toggleBtn.classList.remove("on");
        toggleBtn.setAttribute("aria-label", "Enter fullscreen mode");
      }
    }
  } else {
    console.warn("Fullscreen API not supported");
    toggleBtn.style.display = "none";
  }
});

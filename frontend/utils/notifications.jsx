export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("Este navegador não suporta notificações");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('Permissão de notificação:', permission);
    return permission === 'granted';
  } catch (error) {
    console.error('Erro ao solicitar permissão:', error);
    return false;
  }
}

export function showNotification(title, options = {}) {
  console.log('Tentando mostrar notificação:', { title, options });

  if (!("Notification" in window)) {
    console.log("Notificações não suportadas");
    return;
  }

  if (Notification.permission !== "granted") {
    console.log("Permissão não concedida para notificações");
    requestNotificationPermission();
    return;
  }

  try {
    if (document.hasFocus()) {
      console.log("Janela em foco, notificação ignorada");
      return;
    }

    const notification = new Notification(title, {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      vibrate: [200, 100, 200],
      ...options
    });

    notification.onclick = function() {
      window.focus();
      this.close();
    };

    console.log('Notificação criada com sucesso');
    return notification;
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
  }
}

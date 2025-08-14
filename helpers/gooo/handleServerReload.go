package gooo

import (
	"Gooo/constants"
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

func HandleServerReload(echo *echo.Echo, isLocal bool) {
	if isLocal {
		echo.GET("/ws/reload", reloadWebSocket)
		go func() {
			// time.Sleep(1 * time.Second) // Initial delay to let server stabilize
			log.Println(constants.Green + "[dev] Initiating client reload broadcast..." + constants.Reset)
			broadcastReload()
		}()
	}
}

var (
	reloadClients   = make(map[*websocket.Conn]bool)
	reloadCLientsMu sync.Mutex
	upgrader        = websocket.Upgrader{}
)

// reloadWebSocket sets up a websocket to listen for reload events and
// automatically reload connected clients when the server restarts.
// It's used by the vite dev server to communicate with the client to reload
// the page when the server restarts.
func reloadWebSocket(c echo.Context) error {
	conn, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return err
	}

	reloadCLientsMu.Lock()
	reloadClients[conn] = true
	reloadCLientsMu.Unlock()

	go func() {
		defer func() {
			reloadCLientsMu.Lock()
			delete(reloadClients, conn)
			reloadCLientsMu.Unlock()
			conn.Close()
		}()
		for {
			if _, _, err := conn.NextReader(); err != nil {
				break
			}
		}
	}()

	return nil
}

// broadcastReload sends a WebSocket message to all connected clients to reload
// the page, but only after at least one client is connected or a timeout is reached.
func broadcastReload() {
	// Wait for at least one client or timeout after 5 seconds
	timeout := time.After(5 * time.Second)
	ticker := time.NewTicker(500 * time.Millisecond)
	defer ticker.Stop()

	for {
		select {
		case <-timeout:
			log.Println(constants.Yellow + "[dev] No clients connected after timeout, skipping reload broadcast" + constants.Reset)
			return
		case <-ticker.C:
			reloadCLientsMu.Lock()
			if len(reloadClients) > 0 {
				log.Println(constants.Green+"[dev] Broadcasting client reload to", len(reloadClients), "clients..."+constants.Reset)
				for conn := range reloadClients {
					if err := conn.WriteMessage(websocket.TextMessage, []byte("reload")); err != nil {
						conn.Close()
						delete(reloadClients, conn)
					}
				}
				reloadCLientsMu.Unlock()
				return
			}
			reloadCLientsMu.Unlock()
		}
	}
}

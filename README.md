# 🖐️ Hand Gesture Recognition System

As art and creativity are my passion, I wanted to explore a new way of drawing without using traditional tools like a mouse or touchscreen. This project combines digital art with hand gesture recognition technology to create a virtual drawing system controlled entirely by hand movements.

Using computer vision and MediaPipe, the system detects hand gestures through a webcam and responds in real time by drawing, selecting colours, creating shapes, and performing other actions. The project aims to make human-computer interaction more natural, interactive, and creative through touchless gesture-based control.

---

## 📌 Features

* ✋🤚 **Dual Hand Tracking**

  * Tracks up to two hands simultaneously.
  * Displays separate cursors for each hand.

* 🎨 **Color Selection**

  * Vertical rainbow color bar for selecting colors.
  * Real-time color preview.

* ✏️ **Drawing Tools**

  * Pencil
  * Eraser
  * Paint 

* 🔷 **Shape Drawing**

  * Square & Rectangle
  * Circle
  * Triangle
  * Line
  * Arrow
  * Star

* 🖐️ **Gesture Controls**

  * ☝️ → Move cursor on canvas
  * 🤏 → Draw or place shapes.
  * ✌️ → Select tools or colors.
  * 🖐️ → Move cursor without drawing.
  * ✊ → Clear the canvas.

* 🧠 **Smooth Cursor Movement**

  * Exponential smoothing is used to reduce jitter and provide natural hand movement.

* ⚡ **Runs Completely in Browser**

  * No server required.
  * No image upload or external processing.
  * All computation happens locally in the browser.

---

## 🛠️ Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript (ES6)

### Libraries

* MediaPipe Hands
* MediaPipe Camera Utils

### Canvas APIs

* HTML5 Canvas API
* 2D Context for drawing and rendering

---

## 📂 Project Structure

```text
Hand-Gesture-Recognition-System/
│
├── index.html      # Main webpage
├── style.css       # Styling and UI
├── script.js       # Gesture recognition and drawing logic
├── README.md
```

---

## ⚙️ Working Principle

1. The browser requests camera permission.
2. MediaPipe detects hand landmarks (21 points per hand).
3. The system classifies gestures such as:

   * Pinch
   * Peace
   * Open Palm
   * Fist
4. Based on the detected gesture:

   * Draw on canvas
   * Select tools
   * Change colors
   * Clear canvas
5. The result is displayed in real time on the virtual drawing board.

---

## ✋ Gesture Mapping

| Gesture                | Action                     |
| ---------------------  | -------------------------- |
| Pinch (🤏)            | Draw / Place Shapes        |
| Peace (✌️)            | Select Tool / Select Color |
| Open Palm (🖐️)        | Move Cursor                |
| Fist (✊)             | Clear Canvas               |

---

## 🚀 Future Enhancements

* Add more gestures.
* Support text input using gestures.
* Implement undo/redo functionality.
* Add gesture-based brush size control.
* Integrate machine learning models for custom gestures.

---

## 📈 Advantages

* Contactless interaction.
* Natural and intuitive user experience.
* Works directly in the browser.
* Useful for education, digital art, and accessibility applications.

---

## 👨‍💻 Developed By

**Y. SARANYA**

Project: **Hand Gesture Recognition System**

Using HTML, CSS, JavaScript, and MediaPipe Hands.

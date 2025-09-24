# **App Name**: AsistenciaFacil

## Core Features:

- Classroom Selection: Display a dropdown menu with a list of classrooms fetched directly from Firestore.
- Student List: Load and display the list of students for the selected classroom from Firestore (salones/{nombre}/estudiantes).
- Attendance Marking: Provide checkboxes next to each student's name to mark them as absent. Save attendance in Firestore.
- Attendance Recording: Save the list of present and absent students for a specific date (YYYY-MM-DD format) under the 'asistencias' collection in Firestore.
- Duplicate Check: Verify if attendance has already been recorded for the current date. If so, update the existing record instead of creating a new one.
- Attendance History: Display a list of past attendance records for a specific classroom, showing the date and the list of absent students for each day.

## Style Guidelines:

- Primary color: Light blue (#ADD8E6) to evoke a sense of calmness and trust.
- Background color: Very light blue (#F0F8FF), nearly white, maintaining a clean and non-distracting interface.
- Accent color: Soft green (#90EE90) to highlight actions and confirmations, indicating positive actions like successful attendance recording.
- Body and headline font: 'PT Sans', a humanist sans-serif, balances modernity with warmth, ensuring readability for student names and attendance data.
- Use simple and clear icons for UI elements such as dropdown menus and confirmation alerts, focusing on clarity and ease of use.
- A clean and responsive layout will ensure usability across devices. The design will prioritize straightforward navigation and easy access to attendance data.
- Subtle animations, like a fade-in effect on data loading or a slide-in for alerts, will provide smooth feedback without being distracting.
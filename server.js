const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON data
app.use(express.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// API endpoint to generate study plan
app.post('/generate-plan', (req, res) => {
    const { subject, deadline, goals } = req.body;

    // Simulate AI-generated study plan
    const studyPlan = `Study Plan for ${subject}:
    - Deadline: ${deadline}
    - Goals: ${goals}
    - Day 1: Read Chapter 1
    - Day 2: Practice Exercises
    - Day 3: Review and Revise`;

    res.json({ plan: studyPlan });
});

// API endpoint for chatbot (using Hugging Face)
app.post('/chatbot', async (req, res) => {
    const { message } = req.body;

    try {
        // Call Hugging Face's Inference API
        const response = await fetch('https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer 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', // Replace with your API key
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                inputs: message,
                options: {
                    wait_for_model: true, // Wait for the model to load
                },
            }),
        });

        // Store the response in a variable
        const data = await response.json();

        // Log the response for debugging
        console.log('API Response:', data);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const chatbotResponse = data[0]?.generated_text || 'Sorry, I could not generate a response.';
        res.json({ response: chatbotResponse });
    } catch (error) {
        console.error('Hugging Face API Error:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
});
// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


// Add a task to Google Calendar
function addTaskToCalendar(task) {
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    const event = {
        summary: task.taskName,
        start: {
            dateTime: `${task.date}T${task.time}:00`,
            timeZone: 'UTC',
        },
        end: {
            dateTime: `${task.date}T${task.time}:00`,
            timeZone: 'UTC',
        },
    };

    calendar.events.insert(
        {
            calendarId: 'primary',
            resource: event,
        },
        (err, res) => {
            if (err) return console.error('Error creating event:', err);
            console.log('Event created:', res.data.htmlLink);
        }
    );
}
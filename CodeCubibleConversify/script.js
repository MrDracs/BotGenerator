document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('agent-form');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const nextBtn = document.getElementById('nextBtn');
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    const sendMessageBtn = document.getElementById('send-message');
    let chatbotId = '';  // Variable to store chatbotId from first form
    let previousMessages = [];  // Store conversation history

    // Step 1: Handle Next button click (First form submission)
    nextBtn.addEventListener('click', function() {
        // Basic validation
        const requiredFields = step1.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
            } else {
                field.classList.remove('error');
            }
        });

        if (isValid) {
            // Collect form data from step 1
            const agentName = document.getElementById('agentName').value.trim();
            const agentTonality = document.getElementById('agentTonality').value;
            const personalizeAgent = document.getElementById('personalizeAgent').value.trim();

            // Prepare the data to send to the API
            const requestData = {
               
                name: agentName,
                temperature: agentTonality,
                contextMessage: personalizeAgent
            };

            // Send data to the API (chatbot creation)
            fetch('http://localhost:5000/api/chatbots', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.chatbotId) {
                    // If API call is successful, store chatbotId and show step2
                    chatbotId = data.chatbotId;
                    step1.style.display = 'none';
                    step2.style.display = 'block';
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while processing your request.');
            });
        }
    });

    // Step 2: Handle Add Question button click (optional)
    addQuestionBtn.addEventListener('click', function() {
        const questionsArea = document.getElementById('specifyQuestions');
        questionsArea.value += questionsArea.value ? '\n' : '';
        questionsArea.value += '- ';
        questionsArea.focus();
    });

    // Step 2: Handle form submission for knowledge (Upload document)
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Collect data from the second form
        const specifyQuestions = document.getElementById('specifyQuestions').value;
        const uploadContext = document.getElementById('uploadContext').files[0];

        // Check if a PDF file is uploaded
        if (!uploadContext) {
            alert('Please upload a context file (PDF).');
            return;
        }

        // Prepare form data for API
        const formData = new FormData();
        formData.append('chatbotId', chatbotId);  // Append chatbotId from the first form
        formData.append('content', specifyQuestions);  // Append user questions/instructions
        formData.append('pdf', uploadContext);  // Append uploaded PDF file

        // Send data to the API (knowledge creation)
        fetch('http://localhost:5000/api/knowledge', {
            method: 'POST',
            body: formData  // Sending as form data (for file upload)
        })
        .then(response => response.json())
        .then(data => {
            if (data.message && data.message.includes('successfully')) {
                // Move to step 3 if knowledge creation is successful
                step2.style.display = 'none';
                step3.style.display = 'block';
                loadEmbedOptions();  // Load embed options for step 3
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while uploading the document.');
        });
    });

    // Step 3: Load Embed Options
    function loadEmbedOptions() {
        fetch(`http://localhost:5000/api/chatbots/${chatbotId}/config`)
            .then(response => response.json())
            .then(data => {
                if (data) {
                    const iframeEmbed = `<div class="side-bar-fs"><iframe src="http://localhost:3000/chat/${chatbotId}" width='80%' height="100%" frameborder='none'></iframe></div>`;
                    const cssEmbed = `.side-bar-fs{
width: 30vw;
height:95vh;
margin: auto;
margin-left: 69vw;
position: relative;
background: none;
overflow: hidden;
z-index: 100;
}
iframe{
margin: auto;
position: relative;
background-color: none;
width: 100%;
height: 100%;
}`;
                    // Populate embed fields
                    document.getElementById('embed-title').innerText = `Embed Your Chatbot: ${data.name}`;
                    document.getElementById('iframe-embed').value = iframeEmbed;
                    document.getElementById('cssEmbed').value = cssEmbed;
                    document.getElementById('botWidget').src = `"http://localhost:3000/chat/66e5b818f161486041c6067d"`;
                } else {
                    alert('Error fetching embed options');
                }
            })
            .catch(error => {
                console.error('Error fetching embed options:', error);
                alert('An error occurred while fetching embed options.');
            });
    }

  
    });



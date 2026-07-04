document.getElementById('normalServiceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const phone = document.getElementById('userPhoneInput').value;
    const date = document.getElementById('bookDate').value;
    const type = document.getElementById('vehicleType').value;

    const receiptMessage = `Mobile Garage Receipt: Your scheduled maintenance booking for ${type} on ${date} is confirmed! Our service center coordinator will contact you shortly. Thanks!`;

    // 1. Dispatch notification alert payload to our backend server framework
    try {
        await fetch('/api/send-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: phone, message: receiptMessage })
        });
    } catch (err) { 
        console.error("SMS communication failure:", err); 
    }

    // 2. Open Success Pop-Up window by removing the hidden tracking rule class
    document.getElementById('successModalText').innerHTML = `Your scheduled profile has been registered successfully!<br>A confirmation receipt summary packet was pushed to cellular lines at <span class="text-emerald-400 font-bold">+91 ${phone}</span>.`;
    document.getElementById('successModal').classList.remove('popup-hidden');
});

// 3. Clear window tracking parameters when closing modal layout element
document.getElementById('closeModalBtn').addEventListener('click', () => {
    document.getElementById('successModal').classList.add('popup-hidden');
    document.getElementById('normalServiceForm').reset();
});
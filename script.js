document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    const form = document.getElementById('drug-form');
    const resultList = document.getElementById('result-list');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log('Form submission triggered.');

        const drugNameInput = document.getElementById('drug-name');
        const opeDateInput = document.getElementById('ope-date');

        const drugName = drugNameInput.value;
        const opeDate = opeDateInput.value;

        if (!drugName || !opeDate) {
            alert('薬剤名と手術予定日を入力してください。');
            console.error('Validation failed: drug name or operation date is missing.');
            return;
        }

        console.log(`Drug Name: ${drugName}, Operation Date: ${opeDate}`);

        const requestData = {
            drug_name: drugName,
            ope_day: opeDate.replace(/-/g, '/') // Format date to YYYY/MM/DD
        };

        console.log('Sending data to backend server:', JSON.stringify(requestData, null, 2));

        // Clear previous results
        resultList.innerHTML = '<li>確認中...</li>';

        try {
            // Call the local backend API endpoint
            const response = await fetch('/api/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            console.log('Received response from backend server.');

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
            }

            const responseData = await response.json();
            console.log('Backend response data:', JSON.stringify(responseData, null, 2));

            // Clear 'loading' message
            resultList.innerHTML = '';

            // The backend now forwards the Dify response, so the structure is the same as before
            if (responseData && responseData.data && responseData.data.outputs && responseData.data.outputs.text) {
                const items = responseData.data.outputs.text.split('\n');
                items.forEach(itemText => {
                    if (itemText.trim()) { // Avoid creating empty list items
                        const listItem = document.createElement('li');
                        listItem.textContent = itemText;
                        resultList.appendChild(listItem);
                    }
                });
            } else {
                resultList.innerHTML = '<li>結果を取得できませんでした。レスポンスの形式を確認してください。</li>';
                console.error('Unexpected response format from backend:', responseData);
            }

        } catch (error) {
            console.error('Error fetching data from backend:', error);
            resultList.innerHTML = `<li>エラーが発生しました: ${error.message}</li>`;
        }
    });
});
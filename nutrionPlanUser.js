
    function calculate() {
        const weight = parseInt(document.getElementById('weight').value, 10);
        const height = parseInt(document.getElementById('height').value, 10);
        const age = parseInt(document.getElementById('age').value, 10);
        const gender = document.getElementById('gender').value;
        const goal = document.getElementById('goal').value;
        const activityLevel = document.getElementById('activity-level').value;

        // Calculate Basal Metabolic Rate (BMR)
        let bmr = 0;
        if (gender === 'female') {
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        } else if (gender === 'male') {
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        }

        // Adjust BMR based on activity level
        let activityFactor = 1.2; // Default for light activity
        if (activityLevel === 'moderate') {
            activityFactor = 1.5;
        } else if (activityLevel === 'active') {
            activityFactor = 1.8;
        }

        // Adjust BMR based on goal
        let calories = 0;
        if (goal === 'maintain') {
            calories = bmr * activityFactor;
        } else if (goal === 'lose') {
            calories = bmr * activityFactor - 500; // Caloric deficit for weight loss
        } else if (goal === 'gain') {
            calories = bmr * activityFactor + 500; // Caloric surplus for weight gain
        }

        // Optimal macronutrient ratios
        const carbRatio = 0.4;
        const proteinRatio = 0.3;
        const fatRatio = 0.3;

        // Calculate macronutrient breakdown
        const carbs = (calories * carbRatio) / 4; // Carbohydrates in grams
        const protein = (calories * proteinRatio) / 4; // Protein in grams
        const fat = (calories * fatRatio) / 9; // Fat in grams

        document.getElementById('output').innerHTML = `
            <h2>Recommended Daily Intake</h2>
            <p>Calories: ${Math.round(calories)}</p>
            <h2>Macronutrient Breakdown</h2>
            <p>Carbohydrates: ${Math.round(carbs)}g</p>
            <p>Protein: ${Math.round(protein)}g</p>
            <p>Fat: ${Math.round(fat)}g</p>
        `;
    }

from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/generate-plan', methods=['POST'])
def generate_plan():
    data = request.json
    subject = data.get('subject')
    deadline = data.get('deadline')
    goals = data.get('goals')

    # Call AI API (e.g., OpenAI) to generate study plan
    study_plan = f"Study Plan for {subject}:\n- Deadline: {deadline}\n- Goals: {goals}"

    return jsonify({"plan": study_plan})

if __name__ == '__main__':
    app.run(debug=True)
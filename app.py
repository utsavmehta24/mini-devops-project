from flask import Flask, render_template, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/health")
def health():
    return "OK", 200

@app.route("/api/info")
def api_info():
    # Data used by the 3D UI to show info for each pipeline step.
    return jsonify({
        "steps": [
            {"id": "code", "title": "Code", "desc": "Your source code (this repo). Push triggers the pipeline."},
            {"id": "build", "title": "Build", "desc": "Dependencies installed, packaging, Docker image build."},
            {"id": "test", "title": "Test", "desc": "Unit/integration tests and static analysis."},
            {"id": "deploy", "title": "Deploy", "desc": "Automated deployment to the chosen target (Render, Railway, Docker host)."}
        ],
        "why": [
            "Faster delivery of features",
            "Reduced manual errors",
            "Consistent builds across environments",
            "Faster feedback for developers"
        ],
        "how": [
            "Push to GitHub → Actions pipeline runs",
            "Pipeline builds image, runs tests and health checks",
            "If green → pipeline deploys automatically"
        ],
        "future": [
            "GitOps / declarative pipelines",
            "Shift-left security (SCA/SAST in CI)",
            "AI-assisted pipelines and test generation",
            "Serverless & edge-native CI/CD",
            "Observability & continuous verification"
        ]
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

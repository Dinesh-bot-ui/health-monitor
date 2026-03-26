from rule_engine import evaluate_rules
from agents.realtime_agent import realtime_analysis
from agents.insight_agent import generate_insight
from agents.medical_agent import medical_validation
from agents.prediction_agent import predict_future
from agents.fitness_agent import generate_fitness_plan
from agents.nutrition_agent import generate_diet_plan

def process_health_data(data):
    result = {}

    # Rule alerts
    alerts = evaluate_rules(data)

    # AI outputs (force string for frontend safety)
    result["alerts"] = alerts
    result["realtime"] = str(realtime_analysis(data))
    result["insight"] = str(generate_insight(data))
    result["medical"] = str(medical_validation(data))
    result["prediction"] = str(predict_future(data))
    result["fitness"] = str(generate_fitness_plan(data))
    result["nutrition"] = str(generate_diet_plan(data))

    return result
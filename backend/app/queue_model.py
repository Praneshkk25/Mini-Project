import math
import logging

logger = logging.getLogger(__name__)

def calculate_mmc_metrics(arrival_rate: float, service_rate: float, num_doctors: int) -> dict:
    """
    Calculates M/M/c queuing theory metrics.
    - arrival_rate (lambda): average patient arrivals per hour
    - service_rate (mu): average patients seen per doctor per hour
    - num_doctors (c): number of active consulting doctors/servers
    """
    if num_doctors <= 0:
        return {
            "utilization": 1.0,
            "avg_wait_time_minutes": 120.0,
            "avg_queue_length": 10.0,
            "status": "No doctors active"
        }
    
    if arrival_rate <= 0:
        return {
            "utilization": 0.0,
            "avg_wait_time_minutes": 0.0,
            "avg_queue_length": 0.0,
            "status": "Optimal"
        }

    # Traffic intensity (rho)
    rho = arrival_rate / (num_doctors * service_rate)
    
    # If system is overloaded (arrival exceeds service capability)
    if rho >= 1.0:
        # Return overloaded metrics
        return {
            "utilization": round(rho, 2),
            "avg_wait_time_minutes": round((arrival_rate / service_rate) * 15, 1), # Empirical bottleneck estimate
            "avg_queue_length": round(arrival_rate * 2, 1),
            "status": "Overloaded (Wait time is increasing)"
        }
    
    # Calculate P0 (probability of 0 patients in system)
    try:
        r = arrival_rate / service_rate
        sum_terms = 0.0
        for n in range(num_doctors):
            sum_terms += (r ** n) / math.factorial(n)
        
        last_term = (r ** num_doctors) / (math.factorial(num_doctors) * (1 - rho))
        p0 = 1.0 / (sum_terms + last_term)
        
        # Calculate Lq (average patients in queue)
        lq = (p0 * (r ** num_doctors) * rho) / (math.factorial(num_doctors) * ((1 - rho) ** 2))
        
        # Calculate Wq (average wait time in queue in hours)
        wq = lq / arrival_rate
        
        # Convert wait time to minutes
        wq_minutes = wq * 60.0
        
        # Total system time W = Wq + 1/mu
        w = wq + (1.0 / service_rate)
        w_minutes = w * 60.0
        
        status = "Optimal" if rho < 0.7 else "Busy"
        
        return {
            "utilization": round(rho, 2),
            "avg_wait_time_minutes": round(wq_minutes, 1),
            "avg_system_time_minutes": round(w_minutes, 1),
            "avg_queue_length": round(lq, 1),
            "status": status
        }
    except Exception as e:
        logger.error(f"Error in MMC math: {str(e)}")
        # Fallback to simple queue estimate
        return {
            "utilization": round(rho, 2),
            "avg_wait_time_minutes": round((arrival_rate / (num_doctors * service_rate)) * 30, 1),
            "avg_queue_length": round(arrival_rate / 2, 1),
            "status": "Calculations offline (Standard model)"
        }

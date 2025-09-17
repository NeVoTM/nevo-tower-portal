/* 
 * MMM Dashboard Integration for partnersnotinvestors.com
 * Add this JavaScript code to your AI Agent website to enable seamless navigation
 * between the MMM Dashboard and AI Agent platforms
 */

// Initialize dashboard integration on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboardIntegration();
});

function initializeDashboardIntegration() {
    console.log('🔗 Initializing MMM Dashboard Integration...');
    
    // Check if user came from MMM Dashboard
    const urlParams = new URLSearchParams(window.location.search);
    const fromDashboard = urlParams.get('source') === 'mmm-dashboard';
    
    if (fromDashboard) {
        console.log('✅ User arrived from MMM Dashboard - enabling enhanced integration');
        
        // Extract dashboard context
        const dashboardContext = {
            returnUrl: decodeURIComponent(urlParams.get('return_url') || ''),
            currentTab: urlParams.get('current_tab') || 'model',
            version: decodeURIComponent(urlParams.get('version') || ''),
            context: urlParams.get('context') || '',
            timestamp: new Date().toISOString()
        };
        
        // Store context for use throughout the session
        localStorage.setItem('dashboard_integration_context', JSON.stringify(dashboardContext));
        
        // Add return to dashboard button
        addReturnToDashboardButton(dashboardContext);
        
        // Add context-aware welcome message
        addDashboardWelcomeMessage(dashboardContext);
        
        // Pre-load Miami Makers Model context
        preloadMMMContext();
        
        // Show integration confirmation
        showIntegrationConfirmation();
    }
    
    // Also check if context exists in localStorage (for page refreshes)
    const storedContext = localStorage.getItem('dashboard_integration_context');
    if (storedContext && !fromDashboard) {
        const context = JSON.parse(storedContext);
        addReturnToDashboardButton(context);
    }
}

function addReturnToDashboardButton(dashboardContext) {
    // Create stylish return button
    const returnButton = document.createElement('button');
    returnButton.id = 'return-to-dashboard-btn';
    returnButton.innerHTML = `
        <span style="margin-right: 8px;">🏗️</span>
        <span>Return to MMM Dashboard</span>
    `;
    
    // Style the button to match the dashboard aesthetic
    returnButton.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        background: linear-gradient(45deg, #1e3c72, #2a5298);
        color: #FFD700;
        border: 2px solid #FFD700;
        padding: 12px 20px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 5px 20px rgba(30, 60, 114, 0.4);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        backdrop-filter: blur(10px);
        text-decoration: none;
        white-space: nowrap;
    `;
    
    // Add hover effects
    returnButton.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05) translateY(-2px)';
        this.style.boxShadow = '0 8px 25px rgba(30, 60, 114, 0.6)';
        this.style.background = 'linear-gradient(45deg, #2a5298, #1e3c72)';
    });
    
    returnButton.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1) translateY(0)';
        this.style.boxShadow = '0 5px 20px rgba(30, 60, 114, 0.4)';
        this.style.background = 'linear-gradient(45deg, #1e3c72, #2a5298)';
    });
    
    // Handle return navigation
    returnButton.addEventListener('click', function() {
        returnToDashboard(dashboardContext);
    });
    
    // Add button to page
    document.body.appendChild(returnButton);
    
    console.log('✅ Return to Dashboard button added');
}

function returnToDashboard(dashboardContext) {
    const confirmReturn = confirm('🏗️ Return to MMM Dashboard?\n\n' +
        `📍 You'll return to the "${dashboardContext.currentTab}" tab\n` +
        `🕒 Dashboard version: ${dashboardContext.version}\n\n` +
        'Your AI Agent session will remain open in this tab.\n\n' +
        'Click OK to return to the dashboard.');
    
    if (confirmReturn) {
        if (dashboardContext.returnUrl) {
            // Open dashboard in the same tab (or new tab if preferred)
            window.open(dashboardContext.returnUrl, '_blank');
            
            // Show success message
            showReturnConfirmation();
        } else {
            alert('⚠️ Dashboard URL not found. Please bookmark the dashboard for easy access.');
        }
    }
}

function addDashboardWelcomeMessage(dashboardContext) {
    // Create welcome message element
    const welcomeMessage = document.createElement('div');
    welcomeMessage.id = 'dashboard-welcome-message';
    welcomeMessage.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <span style="font-size: 20px;">🤖</span>
            <strong>Welcome from MMM Dashboard!</strong>
        </div>
        <div style="font-size: 13px; opacity: 0.9;">
            Context loaded: Miami Makers Model • ${dashboardContext.currentTab} tab • ${dashboardContext.version}
        </div>
    `;
    
    welcomeMessage.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 9998;
        background: rgba(0, 0, 0, 0.85);
        color: #FFD700;
        padding: 15px 20px;
        border-radius: 15px;
        font-size: 14px;
        max-width: 300px;
        line-height: 1.4;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.6);
        border: 1px solid rgba(255, 215, 0, 0.3);
        backdrop-filter: blur(10px);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;
    
    document.body.appendChild(welcomeMessage);
    
    // Auto-remove after 6 seconds
    setTimeout(() => {
        welcomeMessage.style.transition = 'all 0.5s ease-out';
        welcomeMessage.style.opacity = '0';
        welcomeMessage.style.transform = 'translateX(100%)';
        setTimeout(() => welcomeMessage.remove(), 500);
    }, 6000);
}

function preloadMMMContext() {
    // Pre-populate AI context with Miami Makers Model information
    const mmmContext = {
        project: "Miami Makers Model (MMM) - NeVo Tower Development",
        model: "Partners Not Paychecks, Partners Not Investors",
        location: "1580 79th Street Causeway, North Bay Village, Miami",
        units: "68 luxury residential units + 40 hospitality STR suites",
        value: "$180M project valuation",
        approach: "Equity partnership development model",
        benefits: [
            "Reduced cash requirements through partner equity",
            "2x efficiency gains from 'skin in the game' motivation",
            "Active partner governance (Howey Test compliant)",
            "Zero SEC regulatory requirements",
            "Accelerated timelines (6-12 months faster)",
            "Enhanced quality control through equity alignment"
        ]
    };
    
    // Store context for AI system to use
    localStorage.setItem('ai_preloaded_context', JSON.stringify(mmmContext));
    
    // If there's an AI input field, you might want to add a suggestion
    addContextSuggestions();
    
    console.log('✅ MMM context pre-loaded for AI system');
}

function addContextSuggestions() {
    // Look for common AI input elements and add MMM-specific suggestions
    const inputSelectors = ['input[type="text"]', 'textarea', '[contenteditable]', '#chat-input', '.ai-input'];
    
    inputSelectors.forEach(selector => {
        const inputs = document.querySelectorAll(selector);
        inputs.forEach(input => {
            // Add placeholder suggestions for MMM context
            if (input.placeholder) {
                input.placeholder += " • Try: 'Analyze Miami Makers Model' or 'Show NeVo Tower details'";
            } else {
                input.placeholder = "Ask about Miami Makers Model, NeVo Tower, or Partners Not Investors approach...";
            }
        });
    });
}

function showIntegrationConfirmation() {
    // Brief confirmation that integration is active
    const confirmation = document.createElement('div');
    confirmation.innerHTML = '🔗 <strong>Dashboard Integration Active</strong>';
    
    confirmation.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9997;
        background: rgba(76, 205, 196, 0.9);
        color: white;
        padding: 10px 15px;
        border-radius: 10px;
        font-size: 12px;
        font-weight: bold;
        box-shadow: 0 3px 10px rgba(76, 205, 196, 0.4);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;
    
    document.body.appendChild(confirmation);
    
    setTimeout(() => {
        confirmation.style.transition = 'all 0.3s ease-out';
        confirmation.style.opacity = '0';
        setTimeout(() => confirmation.remove(), 300);
    }, 3000);
}

function showReturnConfirmation() {
    const confirmation = document.createElement('div');
    confirmation.innerHTML = '✅ <strong>Returning to Dashboard...</strong>';
    
    confirmation.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10000;
        background: rgba(30, 60, 114, 0.95);
        color: #FFD700;
        padding: 20px 30px;
        border-radius: 15px;
        font-size: 16px;
        font-weight: bold;
        box-shadow: 0 10px 30px rgba(30, 60, 114, 0.6);
        border: 2px solid #FFD700;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;
    
    document.body.appendChild(confirmation);
    
    setTimeout(() => confirmation.remove(), 2000);
}

// Keyboard shortcut for quick return (Ctrl/Cmd + D)
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        const context = localStorage.getItem('dashboard_integration_context');
        if (context) {
            returnToDashboard(JSON.parse(context));
        }
    }
});

// Export functions for external use if needed
window.DashboardIntegration = {
    returnToDashboard: function() {
        const context = localStorage.getItem('dashboard_integration_context');
        if (context) {
            returnToDashboard(JSON.parse(context));
        }
    },
    
    getContext: function() {
        const context = localStorage.getItem('dashboard_integration_context');
        return context ? JSON.parse(context) : null;
    },
    
    getMMMContext: function() {
        const context = localStorage.getItem('ai_preloaded_context');
        return context ? JSON.parse(context) : null;
    }
};

console.log('🚀 MMM Dashboard Integration System Ready');
import os
import streamlit as st
import psycopg2
from psycopg2.extras import RealDictCursor
import pandas as pd
import json


# Import load_env to load credentials
from ai_engine import load_env

# Page configuration
st.set_page_config(
    page_title="Krishivaani.ai Admin Dashboard",
    page_icon="🌾",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Load env variables
load_env()

# Custom premium CSS styling (Green accents, dark mode vibes, clean cards)
st.markdown("""
<style>
    /* Premium fonts and background styling */
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Outfit', sans-serif;
    }
    
    /* Title and Header customization */
    .dashboard-title {
        font-weight: 800;
        font-size: 2.8rem;
        background: linear-gradient(135deg, #10B981 0%, #059669 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.2rem;
    }
    .dashboard-subtitle {
        color: #6B7280;
        font-size: 1.1rem;
        margin-bottom: 2rem;
    }
    
    /* Glassmorphism Metric Cards */
    .metric-card {
        background: rgba(16, 185, 129, 0.05);
        border: 1px solid rgba(16, 185, 129, 0.15);
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .metric-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.1);
    }
    .metric-value {
        font-size: 2.2rem;
        font-weight: 800;
        color: #10B981;
        margin-bottom: 0.2rem;
    }
    .metric-label {
        font-size: 0.9rem;
        color: #4B5563;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 600;
    }
    
    /* Inspect detail panel styling */
    .detail-container {
        background: #F9FAFB;
        border-radius: 12px;
        padding: 1.5rem;
        border: 1px solid #E5E7EB;
        margin-top: 1rem;
    }
    
    /* AI Output pill */
    .ai-pill {
        background-color: #EEF2F6;
        border-left: 4px solid #3B82F6;
        padding: 0.8rem;
        border-radius: 4px;
        font-family: monospace;
    }
</style>
""", unsafe_allow_html=True)

def get_db_connection():
    """Establish connection to PostgreSQL using psycopg2."""
    database_url = os.environ.get("DATABASE_URL")
    
    if database_url and "YOUR_DB_PASSWORD_HERE" not in database_url:
        return psycopg2.connect(database_url)
        
    host = os.environ.get("DB_HOST", "aws-1-ap-southeast-1.pooler.supabase.com")
    port = os.environ.get("DB_PORT", "5432")
    name = os.environ.get("DB_NAME", "postgres")
    user = os.environ.get("DB_USER", "postgres.mbmkpyhxzicdayuwdsqi")
    password = os.environ.get("DB_PASSWORD")
    
    return psycopg2.connect(
        host=host,
        port=port,
        dbname=name,
        user=user,
        password=password
    )

def fetch_escalated_cases(region_filter: str = None) -> list:
    """Fetch escalated cases from PostgreSQL, joining profiles metadata."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            query = """
                SELECT 
                    c.id as case_id,
                    c.profile_id,
                    c.crop_type,
                    c.user_message_text,
                    c.audio_storage_url,
                    c.image_storage_url,
                    c.ai_diagnosis_output,
                    c.status,
                    c.created_at,
                    p.farmer_name,
                    p.preferred_language,
                    p.village_name,
                    p.latitude,
                    p.longitude,
                    p.soil_profile
                FROM cases c
                JOIN profiles p ON c.profile_id = p.phone_number
                WHERE c.status = 'escalated'
            """
            params = []
            if region_filter and region_filter != "All":
                query += " AND p.village_name = %s"
                params.append(region_filter)
                
            query += " ORDER BY c.created_at DESC;"
            cur.execute(query, params)
            return [dict(row) for row in cur.fetchall()]
    except Exception as e:
        st.error(f"Database query failed: {e}")
        return []
    finally:
        conn.close()

def resolve_case(case_id: int, notes: str):
    """Executes a direct database write-back setting status='resolved' and saving notes."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE cases SET status = 'resolved', expert_notes = %s WHERE id = %s;",
                (notes, case_id)
            )
            conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

# Title banner
st.markdown('<div class="dashboard-title">Krishivaani.ai</div>', unsafe_allow_html=True)
st.markdown('<div class="dashboard-subtitle">Enterprise Expert Intervention & Administrative Dashboard</div>', unsafe_allow_html=True)

# 2. Sidebar region filter
st.sidebar.image("https://img.icons8.com/color/96/agriculture.png", width=80)
st.sidebar.title("Navigation & Filters")
selected_region = st.sidebar.selectbox(
    "Target Region Filter",
    options=["All", "Palghar", "Nagpur", "Kanpur"],
    help="Filter open escalated cases based on the farmer's registered village or region."
)

# Fetch data from Supabase DB
open_cases = fetch_escalated_cases(selected_region)
all_open_cases_count = len(fetch_escalated_cases("All"))

# 1. Metric Header Grid
col_metric_1, col_metric_2, col_metric_3 = st.columns(3)
with col_metric_1:
    st.markdown(f"""
    <div class="metric-card">
        <div class="metric-value">{all_open_cases_count}</div>
        <div class="metric-label">Total Escalated Cases (Global)</div>
    </div>
    """, unsafe_allow_html=True)

with col_metric_2:
    region_label = selected_region if selected_region != "All" else "Global"
    st.markdown(f"""
    <div class="metric-card">
        <div class="metric-value">{len(open_cases)}</div>
        <div class="metric-label">Active Regional Cases ({region_label})</div>
    </div>
    """, unsafe_allow_html=True)

with col_metric_3:
    st.markdown(f"""
    <div class="metric-card">
        <div class="metric-value">Pending</div>
        <div class="metric-label">Intervention Status</div>
    </div>
    """, unsafe_allow_html=True)

st.write("---")

# Main interface layout
st.subheader("📋 Open Cases Requiring Expert Analysis")

if not open_cases:
    st.info(f"No escalated cases found for region: **{selected_region}**.")
else:
    # 3. Primary interactive table panel
    df_display = pd.DataFrame(open_cases)[
        ['case_id', 'farmer_name', 'village_name', 'crop_type', 'user_message_text', 'created_at']
    ]
    df_display.columns = ['Case ID', 'Farmer Name', 'Village / Region', 'Crop Type', 'Farmer Message', 'Received Time']
    
    # Render table nicely
    st.dataframe(
        df_display, 
        use_container_width=True,
        column_config={
            "Case ID": st.column_config.NumberColumn(format="%d"),
            "Received Time": st.column_config.DatetimeColumn(format="YYYY-MM-DD HH:mm")
        }
    )

    # 4. Inspection picker selection
    st.subheader("🔍 Case Detailed Inspection Panel")
    case_ids = [c['case_id'] for c in open_cases]
    selected_case_id = st.selectbox(
        "Choose an active case row card to inspect:",
        options=case_ids,
        format_func=lambda x: f"Case ID {x} - {next((c['farmer_name'] for c in open_cases if c['case_id'] == x), 'Unknown')} ({next((c['village_name'] for c in open_cases if c['case_id'] == x), 'Unknown')})"
    )

    # Fetch details of the selected case
    case_details = next((c for c in open_cases if c['case_id'] == selected_case_id), None)

    if case_details:
        # Split layout interface for inspection
        col_left, col_right = st.columns(2)

        with col_left:
            st.markdown("### 🧑‍🌾 Farmer & Geography Metadata")
            st.markdown(f"**Farmer Name:** `{case_details['farmer_name']}`")
            st.markdown(f"**Phone Number:** `{case_details['profile_id']}`")
            st.markdown(f"**Village / Region:** `{case_details['village_name']}`")
            st.markdown(f"**Preferred Language:** `{case_details['preferred_language'].upper()}`")
            st.markdown(f"**Active Coordinates:** Latitude `{case_details['latitude']}`, Longitude `{case_details['longitude']}`")
            
            # Map rendering
            if case_details['latitude'] and case_details['longitude']:
                map_df = pd.DataFrame([{
                    'lat': case_details['latitude'],
                    'lon': case_details['longitude']
                }])
                st.map(map_df, zoom=10, size=20)
            
            # Render live image
            st.markdown("### 📸 Live Image Attachment")
            if case_details['image_storage_url']:
                st.image(
                    case_details['image_storage_url'], 
                    caption=f"Crop Leaf Image for Case {selected_case_id}",
                    use_column_width=True
                )
            else:
                st.warning("No image attachment available for this case.")

        with col_right:
            st.markdown("### 🤖 Automated AI Diagnosis parameters")
            try:
                # Parse AI Diagnosis
                if isinstance(case_details['ai_diagnosis_output'], str):
                    ai_out = json.loads(case_details['ai_diagnosis_output'])
                else:
                    ai_out = case_details['ai_diagnosis_output']
            except Exception:
                ai_out = {}

            if ai_out:
                st.markdown(f"**Identified Disease:** `{ai_out.get('disease', 'N/A')}`")
                st.markdown(f"**Confidence Score:** `{ai_out.get('confidence', 0.0) * 100:.1f}%`")
                st.markdown(f"**Action Required:** `{ai_out.get('action_required', 'N/A')}`")
                st.markdown("**AI Generated Remedy:**")
                st.info(ai_out.get('remedy', 'No remedy details returned by AI.'))
            else:
                st.warning("No structured AI diagnosis parameters found.")

            st.write("---")

            # 5. Expert Intervention Notes Input Form
            st.markdown("### ✍️ Expert Intervention & Resolve Case")
            with st.form(key=f"resolve_form_{selected_case_id}", clear_on_submit=True):
                expert_notes = st.text_area(
                    label="Expert Intervention Notes",
                    placeholder="Enter diagnostic recommendations, treatment instructions, and expert remarks here...",
                    help="These notes will be logged in the database and the case will be closed.",
                    height=150
                )
                submit_button = st.form_submit_button(label="Resolve and Close Case")

                if submit_button:
                    if not expert_notes.strip():
                        st.error("Please enter expert notes before submitting.")
                    else:
                        with st.spinner("Writing back to database and closing case..."):
                            try:
                                resolve_case(selected_case_id, expert_notes)
                                st.success(f"Case {selected_case_id} resolved and closed successfully!")
                                # Rerun to refresh table
                                st.rerun()
                            except Exception as e:
                                st.error(f"Failed to write to database: {e}")

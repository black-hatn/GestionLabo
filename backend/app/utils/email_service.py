"""Email notification service using smtplib."""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from app.config.settings import get_settings

def get_s():
    return get_settings()

def send_email(to: str, subject: str, html_body: str) -> bool:
    s = get_s()
    if not s.SMTP_ENABLED or not s.SMTP_USER:
        print(f"[EMAIL-DISABLED] Would send to {to}: {subject}")
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = s.SMTP_FROM or s.SMTP_USER
        msg["To"] = to
        msg.attach(MIMEText(html_body, "html"))
        with smtplib.SMTP(s.SMTP_HOST, s.SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(s.SMTP_USER, s.SMTP_PASSWORD)
            server.sendmail(s.SMTP_FROM or s.SMTP_USER, to, msg.as_string())
        print(f"[EMAIL-OK] Sent to {to}: {subject}")
        return True
    except Exception as e:
        print(f"[EMAIL-ERROR] {to}: {e}")
        return False

def send_result_notification(patient_email: str, patient_name: str, exam_type: str, status: str, result_id: str) -> bool:
    if status == "CRITIQUE":
        subject = f"⚠️ RÉSULTAT CRITIQUE — {exam_type} | NovaBio Lab"
        color = "#ef4444"
        badge = "RÉSULTAT CRITIQUE"
        message = "Un résultat <strong>critique</strong> a été détecté. Veuillez contacter votre médecin immédiatement."
    elif status == "TERMINE":
        subject = f"✅ Résultat disponible — {exam_type} | NovaBio Lab"
        color = "#10b981"
        badge = "RÉSULTAT DISPONIBLE"
        message = "Votre résultat d'analyse est disponible. Connectez-vous pour le consulter."
    else:
        return False
    html_body = f"""<!DOCTYPE html><html><body style="font-family:sans-serif;background:#050c1a;padding:40px 20px;"><div style="max-width:560px;margin:0 auto;background:#0c1828;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;"><div style="background:linear-gradient(135deg,#10b981,#0d9488);padding:32px;text-align:center;"><div style="font-size:24px;font-weight:900;color:white;">NovaBio Lab</div></div><div style="padding:32px;"><div style="display:inline-block;background:{color}20;border:1px solid {color}50;color:{color};padding:6px 14px;border-radius:6px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:20px;">{badge}</div><p style="color:#e2e8f0;font-size:16px;margin:0 0 8px;">Bonjour <strong>{patient_name}</strong>,</p><p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">{message}</p><div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px;margin-bottom:24px;"><div style="color:#64748b;font-size:11px;text-transform:uppercase;margin-bottom:8px;">Analyse</div><div style="color:#e2e8f0;font-weight:700;">{exam_type}</div></div></div><div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;"><p style="color:#334155;font-size:11px;margin:0;">NovaBio Lab · 12 Rue des Alouettes, 75008 Paris</p></div></div></body></html>"""
    return send_email(to=patient_email, subject=subject, html_body=html_body)

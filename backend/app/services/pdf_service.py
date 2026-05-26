from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_report(demande, patient, resultats_with_examen):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    title_style.alignment = 1 # Center
    
    normal_style = styles['Normal']
    
    elements = []
    
    # Header
    elements.append(Paragraph("<b>LABORATOIRE D'ANALYSES L'HORIZON</b>", title_style))
    elements.append(Spacer(1, 20))
    
    # Patient Info
    patient_info = f"""
    <b>Patient:</b> {patient.nom} {patient.prenom}<br/>
    <b>Sexe:</b> {patient.sexe}<br/>
    <b>ID Patient:</b> {patient.id_patient}<br/>
    """
    elements.append(Paragraph(patient_info, normal_style))
    elements.append(Spacer(1, 10))
    
    # Demande Info
    demande_info = f"""
    <b>Dossier N°:</b> {demande.numero_demande}<br/>
    <b>Date:</b> {demande.date_demande.strftime('%d/%m/%Y')}<br/>
    <b>Prescripteur:</b> Dr. {demande.medecin_id if demande.medecin_id else 'Non renseigné'}
    """
    elements.append(Paragraph(demande_info, normal_style))
    elements.append(Spacer(1, 30))
    
    # Results Table
    data = [["Examen", "Résultat", "Unité", "Normes", "Interprétation"]]
    
    for res, examen in resultats_with_examen:
        normes = f"{examen.valeur_min_homme} - {examen.valeur_max_homme}" if examen.valeur_min_homme else "-"
        valeur = str(res.valeur_numerique) if res.valeur_numerique else (res.valeur or "-")
        interpretation = "ANORMAL" if res.est_anormal else "Normal"
        
        data.append([
            examen.libelle,
            valeur,
            examen.unite or "-",
            normes,
            interpretation
        ])
        
    t = Table(data, colWidths=[150, 80, 60, 100, 100])
    
    # Styling table
    style_commands = [
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#4facfe")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.lightgrey),
    ]
    
    # Highlight abnormal results in red
    for i, (res, examen) in enumerate(resultats_with_examen):
        if res.est_anormal:
            style_commands.append(('TEXTCOLOR', (1, i+1), (1, i+1), colors.red))
            style_commands.append(('TEXTCOLOR', (4, i+1), (4, i+1), colors.red))
            style_commands.append(('FONTNAME', (1, i+1), (1, i+1), 'Helvetica-Bold'))
            style_commands.append(('FONTNAME', (4, i+1), (4, i+1), 'Helvetica-Bold'))
            
    t.setStyle(TableStyle(style_commands))
    
    elements.append(t)
    elements.append(Spacer(1, 40))
    
    # Footer / Signature
    elements.append(Paragraph("<b>Biologiste responsable:</b> Dr. L'Horizon", normal_style))
    elements.append(Paragraph("<i>Validé électroniquement - Ce document vaut original</i>", normal_style))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer

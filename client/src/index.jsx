import './style.css';
import { useRef, useState } from 'preact/hooks';

function formatFileSize(bytes) {
	if (bytes === 0) return '0 Bytes';
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function App() {
	const [selectedFile, setSelectedFile] = useState(null);
	const [progress, setProgress] = useState(0);
	const [progressText, setProgressText] = useState('');
	const [showPreview, setShowPreview] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);
	const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
	const [downloadUrl, setDownloadUrl] = useState(null);
	const fileInputRef = useRef(null);
	const progressInterval = useRef(null);

	// Drag and Drop
	function onDragOver(e) {
		e.preventDefault();
		e.currentTarget.classList.add('drag-over');
	}
	function onDragLeave(e) {
		e.currentTarget.classList.remove('drag-over');
	}
	function onDrop(e) {
		e.preventDefault();
		e.currentTarget.classList.remove('drag-over');
		const files = e.dataTransfer.files;
		if (files.length > 0) handleFileSelect(files[0]);
	}
	// File Input
	function onFileChange(e) {
		if (e.target.files.length > 0) handleFileSelect(e.target.files[0]);
	}
	// Handle File Selection
	function handleFileSelect(file) {
		const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
		const maxSize = 10 * 1024 * 1024;
		if (!validTypes.includes(file.type)) {
			showToast('Por favor, selecione um arquivo PDF ou DOCX', 'error');
			return;
		}
		if (file.size > maxSize) {
			showToast('O arquivo deve ter no máximo 10MB', 'error');
			return;
		}
		setSelectedFile(file);
		setShowPreview(true);
		setDownloadUrl(null);
		showToast('Arquivo carregado com sucesso!', 'success');
	}
	// Remove File
	function removeFile() {
		setSelectedFile(null);
		setShowPreview(false);
		setProgress(0);
		setProgressText('');
		setDownloadUrl(null);
		if (fileInputRef.current) fileInputRef.current.value = '';
	}
	// Process Document (envia para o backend)
	async function processDocument() {
		if (!selectedFile) return;
		setProgress(0);
		setProgressText('Enviando arquivo...');
		setDownloadUrl(null);
		setShowSuccess(false);
		// Enviar para o backend
		const formData = new FormData();
		formData.append('file', selectedFile);
		try {
			const xhr = new XMLHttpRequest();
			xhr.open('POST', 'https://formatador-abnt-backend.onrender.com/api/upload', true);
			xhr.responseType = 'blob';
			xhr.upload.onprogress = function (event) {
				if (event.lengthComputable) {
					const percent = Math.round((event.loaded / event.total) * 100 * 0.6); // até 60%
					setProgress(percent);
					if (percent <= 30) setProgressText('Enviando arquivo...');
					else setProgressText('Processando no servidor...');
				}
			};
			xhr.onload = function () {
				setProgress(100);
				setProgressText('Concluído!');
				if (xhr.status === 200) {
					// Criar URL para download
					const blob = xhr.response;
					const contentDisposition = xhr.getResponseHeader('Content-Disposition');
					let filename = 'documento-abnt';
					if (contentDisposition) {
						const match = contentDisposition.match(/filename="(.+)"/);
						if (match) filename = match[1];
					}
					const url = window.URL.createObjectURL(blob);
					setTimeout(() => {
						setShowPreview(false);
						setShowSuccess(true);
						setDownloadUrl({ url, filename });
						showToast('Documento formatado com sucesso!', 'success');
					}, 500);
				} else {
					showToast('Erro ao processar o arquivo', 'error');
				}
			};
			xhr.onerror = function () {
				showToast('Erro de conexão com o servidor', 'error');
			};
			xhr.send(formData);
			setProgressText('Enviando arquivo...');
		} catch (err) {
			showToast('Erro ao enviar arquivo', 'error');
		}
	}
	// Download Document
	function downloadDocument() {
		if (downloadUrl) {
			const a = document.createElement('a');
			a.href = downloadUrl.url;
			a.download = downloadUrl.filename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			showToast('Download iniciado...', 'success');
			setTimeout(() => {
				showToast('Download concluído!', 'success');
			}, 2000);
		}
	}
	// Reset Upload
	function resetUpload() {
		setShowSuccess(false);
		removeFile();
	}
	// Toast
	function showToast(message, type = 'success') {
		setToast({ show: true, message, type });
		setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
	}
	// Smooth Scroll
	function smoothScroll(e) {
		e.preventDefault();
		const target = document.querySelector(e.currentTarget.getAttribute('href'));
		if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	return (
		<>
			{/* Header */}
			<header class="header">
				<div class="header-content">
					<div class="logo">
						<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							<path d="M13 3v5a2 2 0 002 2h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
						Formatador ABNT
					</div>
					<nav>
						<ul class="nav-links">
							<li><a href="#como-funciona" onClick={smoothScroll}>Como funciona</a></li>
							<li><a href="#recursos" onClick={smoothScroll}>Recursos</a></li>
							<li><a href="#ajuda" onClick={smoothScroll}>Ajuda</a></li>
						</ul>
					</nav>
				</div>
			</header>
			{/* Hero Section */}
			<section class="hero">
				<h1>Formate seus documentos para ABNT em segundos</h1>
				<p>Transforme arquivos PDF e DOCX para o padrão ABNT de forma rápida e automática</p>
				<div class="features">
					<div class="feature">
						<svg class="feature-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="currentColor"/>
						</svg>
						<span>Formatação automática</span>
					</div>
					<div class="feature">
						<svg class="feature-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="currentColor"/>
						</svg>
						<span>Suporte PDF e DOCX</span>
					</div>
					<div class="feature">
						<svg class="feature-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="currentColor"/>
						</svg>
						<span>100% Gratuito</span>
					</div>
					<div class="feature">
						<svg class="feature-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="currentColor"/>
						</svg>
						<span>Seguro e privado</span>
					</div>
				</div>
			</section>
			{/* Upload Container */}
			<div class="upload-container">
				{!showPreview && !showSuccess && (
					<div class="upload-area" id="uploadArea" onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
						<input type="file" ref={fileInputRef} class="file-input" accept=".pdf,.docx" onChange={onFileChange} />
						<svg class="upload-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3-3m0 0l3 3m-3-3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
						<div class="upload-text">
							<h3>Arraste seu arquivo aqui</h3>
							<p>ou clique para selecionar</p>
						</div>
						<button class="upload-button" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
							<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M16.88 3.549L14.45 1.12a.4.4 0 00-.566 0L2.12 12.884a.4.4 0 00-.117.283v2.427a.4.4 0 00.4.4h2.427a.4.4 0 00.283-.117L16.88 4.115a.4.4 0 000-.566zM4.67 15.194H2.803v-1.867L12.4 3.73l1.867 1.867-9.597 9.597zm10.163-10.163L13.533 3.73 14.167 3.097l1.3 1.3-.634.634z" fill="currentColor"/>
							</svg>
							Selecionar arquivo
						</button>
						<p style="margin-top: 1rem; font-size: 0.75rem; color: var(--text-secondary);">
							Formatos aceitos: PDF, DOCX • Tamanho máximo: 10MB
						</p>
					</div>
				)}
				{/* File Preview */}
				{showPreview && selectedFile && (
					<div class="file-preview active" id="filePreview">
						<div class="file-info">
							<div class="file-details">
								<div class="file-icon">
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
									</svg>
								</div>
								<div class="file-meta">
									<h4 id="fileName">{selectedFile.name}</h4>
									<p id="fileSize">{formatFileSize(selectedFile.size)}</p>
								</div>
							</div>
							<button class="remove-file" onClick={removeFile}>
								<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" fill="currentColor"/>
								</svg>
							</button>
						</div>
						<div class={`progress-container${progress > 0 ? ' active' : ''}`} id="progressContainer">
							<div class="progress-bar">
								<div class="progress-fill" id="progressFill" style={{ width: progress + '%' }}></div>
							</div>
							<p class="progress-text" id="progressText">{progressText}</p>
						</div>
						<div class="action-buttons">
							<button class="btn btn-primary" onClick={processDocument} disabled={progress > 0 && progress < 100}>
								<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 7.5l5 2.5-5 2.5v-5z" fill="currentColor"/>
								</svg>
								Formatar para ABNT
							</button>
							<button class="btn btn-secondary" onClick={removeFile} disabled={progress > 0 && progress < 100}>
								Cancelar
							</button>
						</div>
					</div>
				)}
			</div>
			{/* Success Container */}
			{showSuccess && (
				<div class="success-container active" id="successContainer">
					<div class="success-card">
						<svg class="success-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
						<h3>Documento formatado com sucesso!</h3>
						<p>Seu arquivo foi convertido para o padrão ABNT e está pronto para download.</p>
						<div class="action-buttons">
							<button class="btn btn-primary" onClick={downloadDocument} disabled={!downloadUrl}>
								<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" fill="currentColor"/>
								</svg>
								Baixar documento
							</button>
							<button class="btn btn-secondary" onClick={resetUpload}>
								Formatar outro arquivo
							</button>
						</div>
					</div>
				</div>
			)}
			{/* Footer */}
			<footer class="footer">
				<p>© 2025 Formatador ABNT. Desenvolvido com ❤️ para facilitar sua vida acadêmica.</p>
			</footer>
			{/* Toast Notification */}
			<div class={`toast${toast.show ? ' show' : ''} ${toast.type}`} id="toast">
				<svg class="toast-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
				<span id="toastMessage">{toast.message}</span>
			</div>
		</>
	);
}

import { render } from 'preact';
render(<App />, document.getElementById('app'));

window.watsonAssistantChatOptions = {
	integrationID: "68a0f4dc-2571-4f64-b452-1321d022fee8", // The ID of this integration.
	region: "au-syd", // The region your integration is hosted in.
	serviceInstanceID: "5b5dbcd8-6d8c-435a-8d69-72c4e70b22bc", // The ID of your service instance.
	onLoad: async (instance) => { await instance.render(); }
};
setTimeout(function(){
	const t=document.createElement('script');
	t.src="https://web-chat.global.assistant.watson.appdomain.cloud/versions/" + (window.watsonAssistantChatOptions.clientVersion || 'latest') + "/WatsonAssistantChatEntry.js";
	document.head.appendChild(t);
});
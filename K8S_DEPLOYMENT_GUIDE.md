# 🚀 Guide de Déploiement Kubernetes - CodeArena

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Architecture](#architecture)
3. [Structure du Projet](#structure-du-projet)
4. [Configuration](#configuration)
5. [Construction des Images](#construction-des-images)
6. [Déploiement](#déploiement)
7. [Vérification](#vérification)
8. [Mise à l'échelle](#mise-à-léchelle)
9. [Monitoring](#monitoring)
10. [Dépannage](#dépannage)

---

## 🎯 Prérequis

### Logiciels Requis

- **Docker** >= 20.10
- **Kubernetes** >= 1.24
- **kubectl** >= 1.24
- **Helm** >= 3.0 (optionnel)

### Cluster Kubernetes

Vous pouvez utiliser:
- Minikube (local)
- Kind (local)
- GKE (Google Kubernetes Engine)
- EKS (Amazon Elastic Kubernetes Service)
- AKS (Azure Kubernetes Service)

### Accès Registry Docker

- Docker Hub
- Google Container Registry (GCR)
- Amazon ECR
- Azure Container Registry (ACR)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        INGRESS                              │
│               (nginx-ingress-controller)                    │
└──────────────────┬──────────────────┬──────────────────────┘
                   │                  │
        ┌──────────┴────────┐    ┌───┴──────────┐
        │   FRONTEND (3x)   │    │ BACKEND (3x)  │
        │   Nginx + React   │    │   Node.js     │
        └───────────────────┘    └───┬───────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
            ┌───────┴───────┐  ┌────┴────┐    ┌─────┴─────┐
            │  SANDBOX (5x) │  │  REDIS  │    │ SUPABASE  │
            │  Code Exec    │  │  Cache  │    │    DB     │
            └───────────────┘  └─────────┘    └───────────┘
```

---

## 📁 Structure du Projet

```
codearena/
├── docker/                      # Dockerfiles
│   ├── frontend/
│   │   ├── Dockerfile          # Frontend React + Nginx
│   │   └── nginx.conf          # Config Nginx
│   ├── backend/
│   │   ├── Dockerfile          # Backend Node.js
│   │   ├── server.js           # Serveur Express
│   │   └── package.json        # Dependencies
│   └── sandbox/
│       ├── Dockerfile          # Sandbox sécurisé
│       └── execute.sh          # Script d'exécution
│
├── k8s/                         # Manifests Kubernetes
│   ├── config/
│   │   ├── namespace.yaml      # Namespace codearena
│   │   ├── configmap.yaml      # Configuration
│   │   └── secret.yaml         # Secrets (Supabase, etc.)
│   ├── frontend/
│   │   ├── deployment.yaml     # Deployment Frontend (3 replicas)
│   │   └── service.yaml        # Service ClusterIP
│   ├── backend/
│   │   ├── deployment.yaml     # Deployment Backend (3 replicas)
│   │   ├── service.yaml        # Service ClusterIP
│   │   └── hpa.yaml            # HorizontalPodAutoscaler
│   ├── redis/
│   │   ├── deployment.yaml     # Redis pour le cache
│   │   └── service.yaml        # Service Redis
│   ├── sandbox/
│   │   └── deployment.yaml     # Sandbox isolé (5 replicas)
│   └── ingress/
│       └── ingress.yaml        # Ingress Controller
│
└── scripts/
    ├── build-images.sh         # Construire toutes les images
    └── deploy.sh               # Déployer sur K8s
```

---

## ⚙️ Configuration

### 1. Configurer les Secrets Supabase

Éditez `k8s/config/secret.yaml`:

```bash
# Encoder vos clés en base64
echo -n "https://votre-projet.supabase.co" | base64
echo -n "votre-anon-key" | base64
echo -n "votre-service-role-key" | base64
```

Remplacez les valeurs dans le fichier:

```yaml
data:
  SUPABASE_URL: <votre-url-encodée>
  SUPABASE_ANON_KEY: <votre-anon-key-encodée>
  SUPABASE_SERVICE_KEY: <votre-service-key-encodée>
```

### 2. Configurer le Domaine

Éditez `k8s/ingress/ingress.yaml`:

```yaml
spec:
  tls:
  - hosts:
    - votre-domaine.com    # ← Changez ici
    secretName: codearena-tls
  rules:
  - host: votre-domaine.com  # ← Changez ici
```

---

## 🐳 Construction des Images

### Option 1: Script Automatique

```bash
# Construire toutes les images
./scripts/build-images.sh

# Avec un registry personnalisé
DOCKER_REGISTRY=gcr.io \
DOCKER_NAMESPACE=mon-projet \
VERSION=v1.0.0 \
./scripts/build-images.sh
```

### Option 2: Manuel

```bash
# Frontend
docker build -t codearena/frontend:latest \
  -f docker/frontend/Dockerfile .

# Backend
docker build -t codearena/backend:latest \
  -f docker/backend/Dockerfile \
  docker/backend/

# Sandbox
docker build -t codearena/sandbox:latest \
  -f docker/sandbox/Dockerfile .
```

### Push vers Registry

```bash
# Tagguer pour votre registry
docker tag codearena/frontend:latest gcr.io/mon-projet/frontend:v1.0.0
docker tag codearena/backend:latest gcr.io/mon-projet/backend:v1.0.0
docker tag codearena/sandbox:latest gcr.io/mon-projet/sandbox:v1.0.0

# Push
docker push gcr.io/mon-projet/frontend:v1.0.0
docker push gcr.io/mon-projet/backend:v1.0.0
docker push gcr.io/mon-projet/sandbox:v1.0.0
```

---

## 🚀 Déploiement

### Option 1: Script Automatique

```bash
./scripts/deploy.sh
```

### Option 2: Manuel Étape par Étape

```bash
# 1. Créer le namespace
kubectl apply -f k8s/config/namespace.yaml

# 2. Créer les ConfigMaps et Secrets
kubectl apply -f k8s/config/configmap.yaml
kubectl apply -f k8s/config/secret.yaml

# 3. Déployer Redis
kubectl apply -f k8s/redis/

# 4. Déployer le Backend
kubectl apply -f k8s/backend/

# 5. Déployer le Frontend
kubectl apply -f k8s/frontend/

# 6. Déployer le Sandbox
kubectl apply -f k8s/sandbox/

# 7. Déployer l'Ingress
kubectl apply -f k8s/ingress/
```

---

## ✅ Vérification

### Vérifier les Pods

```bash
kubectl get pods -n codearena

# Sortie attendue:
NAME                                  READY   STATUS    RESTARTS   AGE
frontend-deployment-xxx               1/1     Running   0          2m
frontend-deployment-yyy               1/1     Running   0          2m
frontend-deployment-zzz               1/1     Running   0          2m
backend-deployment-aaa                1/1     Running   0          2m
backend-deployment-bbb                1/1     Running   0          2m
backend-deployment-ccc                1/1     Running   0          2m
redis-deployment-xxx                  1/1     Running   0          2m
sandbox-deployment-xxx                1/1     Running   0          2m
...
```

### Vérifier les Services

```bash
kubectl get svc -n codearena

# Sortie attendue:
NAME               TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)
frontend-service   ClusterIP   10.x.x.x       <none>        80/TCP
backend-service    ClusterIP   10.x.x.x       <none>        3000/TCP
redis-service      ClusterIP   10.x.x.x       <none>        6379/TCP
```

### Vérifier l'Ingress

```bash
kubectl get ingress -n codearena

# Sortie attendue:
NAME                CLASS   HOSTS                  ADDRESS          PORTS
codearena-ingress   nginx   codearena.example.com  x.x.x.x          80, 443
```

### Logs des Pods

```bash
# Frontend
kubectl logs -n codearena deployment/frontend-deployment

# Backend
kubectl logs -n codearena deployment/backend-deployment --tail=100 -f

# Specific pod
kubectl logs -n codearena <pod-name> --tail=50
```

### Accéder à l'Application

1. **Via Ingress**: `https://votre-domaine.com`

2. **Via Port-Forward** (test local):
```bash
# Frontend
kubectl port-forward -n codearena svc/frontend-service 8080:80

# Backend
kubectl port-forward -n codearena svc/backend-service 3000:3000

# Accéder via http://localhost:8080
```

---

## 📊 Mise à l'échelle

### Autoscaling (HPA)

L'Horizontal Pod Autoscaler est déjà configuré pour le backend:

```bash
# Vérifier le HPA
kubectl get hpa -n codearena

NAME          REFERENCE                      TARGETS   MINPODS   MAXPODS   REPLICAS
backend-hpa   Deployment/backend-deployment  45%/70%   3         10        3
```

### Scaling Manuel

```bash
# Augmenter le nombre de replicas du frontend
kubectl scale deployment frontend-deployment -n codearena --replicas=5

# Augmenter le backend
kubectl scale deployment backend-deployment -n codearena --replicas=7

# Sandbox
kubectl scale deployment sandbox-deployment -n codearena --replicas=10
```

---

## 📈 Monitoring

### Metrics Server (requis pour HPA)

```bash
# Installer metrics-server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Vérifier
kubectl top nodes
kubectl top pods -n codearena
```

### Prometheus + Grafana (optionnel)

```bash
# Avec Helm
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring --create-namespace
```

---

## 🔧 Dépannage

### Pod ne démarre pas

```bash
# Voir les événements
kubectl describe pod <pod-name> -n codearena

# Voir les logs
kubectl logs <pod-name> -n codearena --previous
```

### Image Pull Error

```bash
# Vérifier les secrets d'authentification registry
kubectl create secret docker-registry regcred \
  --docker-server=<votre-registry> \
  --docker-username=<username> \
  --docker-password=<password> \
  -n codearena

# Ajouter au deployment
spec:
  template:
    spec:
      imagePullSecrets:
      - name: regcred
```

### Service non accessible

```bash
# Test de connectivité interne
kubectl run -it --rm debug --image=busybox -n codearena -- sh
wget -O- http://backend-service:3000/health
```

### Problèmes de Secrets

```bash
# Vérifier les secrets
kubectl get secret codearena-secrets -n codearena -o yaml

# Décoder une valeur
kubectl get secret codearena-secrets -n codearena -o jsonpath='{.data.SUPABASE_URL}' | base64 -d
```

---

## 🔄 Mise à Jour

### Rolling Update

```bash
# Mettre à jour l'image
kubectl set image deployment/backend-deployment \
  backend=codearena/backend:v1.1.0 \
  -n codearena

# Suivre le rollout
kubectl rollout status deployment/backend-deployment -n codearena
```

### Rollback

```bash
# Annuler la dernière mise à jour
kubectl rollout undo deployment/backend-deployment -n codearena

# Revenir à une version spécifique
kubectl rollout undo deployment/backend-deployment --to-revision=2 -n codearena
```

---

## 🗑️ Nettoyage

```bash
# Supprimer tous les composants
kubectl delete namespace codearena

# Ou supprimer individuellement
kubectl delete -f k8s/ingress/
kubectl delete -f k8s/frontend/
kubectl delete -f k8s/backend/
kubectl delete -f k8s/redis/
kubectl delete -f k8s/sandbox/
kubectl delete -f k8s/config/
```

---

## 📚 Ressources Supplémentaires

- [Documentation Kubernetes](https://kubernetes.io/docs/)
- [Nginx Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [Cert-Manager](https://cert-manager.io/) (pour SSL/TLS)
- [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets)

---

## 🎉 Félicitations!

Votre plateforme CodeArena est maintenant déployée sur Kubernetes avec:

✅ Haute disponibilité (multiple replicas)
✅ Autoscaling horizontal
✅ Health checks automatiques
✅ Isolation des composants
✅ Gestion sécurisée des secrets
✅ SSL/TLS avec Ingress
✅ Sandbox sécurisé pour l'exécution de code

Profitez de votre plateforme de coding compétitif! 🚀
